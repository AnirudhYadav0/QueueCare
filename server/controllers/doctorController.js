const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { getOrCreateTodayQueue, enrichQueueWithMetrics } = require('../services/queueEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all active doctors
// @route   GET /api/doctors
// @access  Public
const getDoctors = async (req, res, next) => {
  try {
    const { department, availableOnly } = req.query;
    const filter = {};

    if (department) {
      filter.department = department;
    }
    if (availableOnly === 'true') {
      filter.isAvailable = true;
    }

    const doctors = await Doctor.find(filter)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code icon tokenPrefix')
      .populate('clinic', 'name address');

    return sendSuccess(res, { doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code icon tokenPrefix')
      .populate('clinic');

    if (!doctor) {
      return sendError(res, 'Doctor not found', 404);
    }

    return sendSuccess(res, { doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current doctor's today queue
// @route   GET /api/doctors/me/queue
// @access  Private (Doctor)
const getMyTodayQueue = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return sendError(res, 'Doctor profile not found for this user', 404);
    }

    const queue = await getOrCreateTodayQueue(doctor._id);
    const enriched = enrichQueueWithMetrics(queue, doctor.avgConsultationMinutes || 15);

    return sendSuccess(res, { queue: enriched, doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current doctor's appointments
// @route   GET /api/doctors/me/appointments
// @access  Private (Doctor)
const getMyAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return sendError(res, 'Doctor profile not found', 404);
    }

    const { date, status } = req.query;
    const query = { doctor: doctor._id };

    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setUTCHours(23, 59, 59, 999));
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone avatar')
      .populate('department', 'name code')
      .sort({ appointmentDate: 1, timeSlot: 1 });

    return sendSuccess(res, { appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle doctor availability
// @route   PATCH /api/doctors/me/availability
// @access  Private (Doctor)
const toggleAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return sendError(res, 'Doctor profile not found', 404);
    }

    if (req.body.isAvailable !== undefined) {
      doctor.isAvailable = req.body.isAvailable;
    } else {
      doctor.isAvailable = !doctor.isAvailable;
    }

    await doctor.save();
    return sendSuccess(res, { doctor }, 'Availability updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor schedule
// @route   PUT /api/doctors/me/schedule
// @access  Private (Doctor)
const updateSchedule = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return sendError(res, 'Doctor profile not found', 404);
    }

    const { workingHours, avgConsultationMinutes, roomNumber } = req.body;
    if (workingHours) doctor.workingHours = workingHours;
    if (avgConsultationMinutes) doctor.avgConsultationMinutes = avgConsultationMinutes;
    if (roomNumber) doctor.roomNumber = roomNumber;

    await doctor.save();
    return sendSuccess(res, { doctor }, 'Schedule updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  getMyTodayQueue,
  getMyAppointments,
  toggleAvailability,
  updateSchedule,
};
