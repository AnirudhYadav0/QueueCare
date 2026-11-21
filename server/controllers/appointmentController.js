const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const { generateCheckInPin, generateQRCodeDataUrl } = require('../services/tokenService');
const { createNotification } = require('../services/notificationService');
const { checkInPatient } = require('../services/queueEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// Helper to generate slots for a day
const generateDayTimeSlots = (start = '09:00', end = '17:00', intervalMinutes = 30) => {
  const slots = [];
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  let current = new Date();
  current.setHours(startHour, startMin, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, endMin, 0, 0);

  while (current < endTime) {
    const formatted = current.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    slots.push(formatted);
    current = new Date(current.getTime() + intervalMinutes * 60000);
  }

  return slots;
};

// @desc    Get available slots for a doctor on a specific date
// @route   GET /api/appointments/slots
// @access  Public
const getAvailableSlots = async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return sendError(res, 'Doctor ID and date are required', 400);
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return sendError(res, 'Doctor not found', 404);
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

    // Get all standard slots for this doctor
    const startHour = doctor.workingHours?.start || '09:00';
    const endHour = doctor.workingHours?.end || '17:00';
    const interval = doctor.avgConsultationMinutes || 30;
    const allSlots = generateDayTimeSlots(startHour, endHour, interval);

    // Find already booked appointments for this doctor on this day
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' },
    }).select('timeSlot');

    const bookedSlotsSet = new Set(bookedAppointments.map((a) => a.timeSlot));

    const slotAvailability = allSlots.map((slot) => ({
      slot,
      isAvailable: !bookedSlotsSet.has(slot),
    }));

    return sendSuccess(res, {
      date,
      doctorId,
      slots: slotAvailability,
      totalSlots: allSlots.length,
      availableCount: slotAvailability.filter((s) => s.isAvailable).length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Patient)
const createAppointment = async (req, res, next) => {
  try {
    const { doctorId, departmentId, appointmentDate, timeSlot, reason, symptoms } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot) {
      return sendError(res, 'Doctor, appointment date, and time slot are required', 400);
    }

    const doctor = await Doctor.findById(doctorId).populate('user');
    if (!doctor) {
      return sendError(res, 'Doctor not found', 404);
    }

    const department = departmentId
      ? await Department.findById(departmentId)
      : await Department.findById(doctor.department);

    const targetDate = new Date(appointmentDate);
    const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

    // Check if slot is already booked
    const existing = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $ne: 'cancelled' },
    });

    if (existing) {
      return sendError(
        res,
        'This time slot has already been booked. Please choose another slot.',
        400
      );
    }

    const checkInPin = generateCheckInPin();

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorId,
      department: department ? department._id : doctor.department,
      clinic: doctor.clinic,
      appointmentDate: startOfDay,
      timeSlot,
      reason: reason || 'Consultation',
      symptoms: symptoms || '',
      checkInPin,
      status: 'scheduled',
    });

    // Generate QR code data URL and payload
    const { payload, qrDataUrl } = await generateQRCodeDataUrl(appointment._id, checkInPin);
    appointment.qrCodeData = qrDataUrl;
    await appointment.save();

    // Send in-app notification
    await createNotification({
      recipient: req.user.id,
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${doctor.user?.name || 'Physician'} is booked for ${targetDate.toLocaleDateString()} at ${timeSlot}.`,
      type: 'appointment',
      relatedAppointment: appointment._id,
      link: `/appointments/${appointment._id}`,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patient', 'name email phone')
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email phone avatar' },
          { path: 'department', select: 'name code icon' },
        ],
      });

    return sendSuccess(
      res,
      { appointment: populatedAppointment },
      'Appointment successfully booked',
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient's appointments
// @route   GET /api/appointments/my
// @access  Private (Patient)
const getMyAppointments = async (req, res, next) => {
  try {
    const { status, filter } = req.query;
    const query = { patient: req.user.id };

    if (status) {
      query.status = status;
    }

    const now = new Date();
    const todayStart = new Date(now.setUTCHours(0, 0, 0, 0));

    if (filter === 'upcoming') {
      query.appointmentDate = { $gte: todayStart };
      query.status = { $in: ['scheduled', 'waiting', 'in_consultation'] };
    } else if (filter === 'past') {
      query.$or = [
        { appointmentDate: { $lt: todayStart } },
        { status: { $in: ['completed', 'cancelled', 'skipped'] } },
      ];
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email avatar' },
          { path: 'department', select: 'name code icon tokenPrefix' },
        ],
      })
      .sort({ appointmentDate: -1, timeSlot: 1 });

    return sendSuccess(res, { appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single appointment details
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email phone avatar')
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email avatar' },
          { path: 'department', select: 'name code icon tokenPrefix' },
          { path: 'clinic' },
        ],
      });

    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    // Ensure authorized access (own patient, assigned doctor, or admin)
    const isOwner = appointment.patient._id.toString() === req.user.id;
    const isDoctor =
      appointment.doctor?.user?._id?.toString() === req.user.id ||
      appointment.doctor?.user?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isDoctor && !isAdmin) {
      return sendError(res, 'Not authorized to view this appointment', 403);
    }

    return sendSuccess(res, { appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
const cancelAppointment = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const appointment = await Appointment.findById(req.params.id).populate('doctor');

    if (!appointment) {
      return sendError(res, 'Appointment not found', 404);
    }

    // Check authorization
    const isOwner = appointment.patient.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return sendError(res, 'Not authorized to cancel this appointment', 403);
    }

    if (['completed', 'cancelled', 'in_consultation'].includes(appointment.status)) {
      return sendError(
        res,
        `Cannot cancel an appointment that is already ${appointment.status}`,
        400
      );
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = reason || 'Cancelled by patient';
    await appointment.save();

    await createNotification({
      recipient: appointment.patient,
      title: 'Appointment Cancelled',
      message: `Your appointment scheduled for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.timeSlot} was cancelled.`,
      type: 'appointment',
      relatedAppointment: appointment._id,
    });

    return sendSuccess(res, { appointment }, 'Appointment successfully cancelled');
  } catch (error) {
    next(error);
  }
};

// @desc    Check-in patient to generate token & enter live queue
// @route   POST /api/appointments/:id/checkin
// @access  Private
const checkIn = async (req, res, next) => {
  try {
    const result = await checkInPatient(req.params.id);
    return sendSuccess(
      res,
      result,
      result.alreadyCheckedIn
        ? 'Already checked in for today'
        : 'Checked in successfully! Token generated.'
    );
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

// @desc    Check-in via QR payload or manual PIN
// @route   POST /api/appointments/qr-checkin
// @access  Public or Private
const checkInByQR = async (req, res, next) => {
  try {
    const { qrData, appointmentId, pin } = req.body;
    let targetAppId = appointmentId;

    if (qrData) {
      try {
        const parsed = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
        targetAppId = parsed.appId;
      } catch (err) {
        targetAppId = qrData;
      }
    }

    if (!targetAppId) {
      return sendError(res, 'Invalid QR code or appointment reference', 400);
    }

    const appointment = await Appointment.findById(targetAppId);
    if (!appointment) {
      return sendError(res, 'Appointment not found for this QR code', 404);
    }

    if (pin && appointment.checkInPin !== pin) {
      return sendError(res, 'Invalid Check-in PIN', 400);
    }

    const result = await checkInPatient(appointment._id);
    return sendSuccess(
      res,
      result,
      'QR Check-In Verified! Token has been assigned.'
    );
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  checkIn,
  checkInByQR,
};
