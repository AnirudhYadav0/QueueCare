const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const {
  getOrCreateTodayQueue,
  enrichQueueWithMetrics,
  callNextPatient,
  callSpecificPatient,
  startConsultation,
  completeConsultation,
  skipPatient,
} = require('../services/queueEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get live queue for a specific doctor
// @route   GET /api/queue/doctor/:doctorId
// @access  Public
const getDoctorQueue = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId)
      .populate('user', 'name avatar')
      .populate('department', 'name code tokenPrefix');

    if (!doctor) {
      return sendError(res, 'Doctor not found', 404);
    }

    const queue = await getOrCreateTodayQueue(doctorId);
    const enriched = enrichQueueWithMetrics(queue, doctor.avgConsultationMinutes || 15);

    return sendSuccess(res, {
      queue: enriched,
      doctor: {
        id: doctor._id,
        name: doctor.user?.name,
        avatar: doctor.user?.avatar,
        specialization: doctor.specialization,
        roomNumber: doctor.roomNumber,
        department: doctor.department?.name,
        isAvailable: doctor.isAvailable,
        avgConsultationMinutes: doctor.avgConsultationMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active queue status for logged-in patient
// @route   GET /api/queue/patient/status
// @access  Private (Patient)
const getPatientQueueStatus = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setUTCHours(23, 59, 59, 999));

    // Prioritize active in_consultation or waiting appointment
    let appointment = await Appointment.findOne({
      patient: req.user.id,
      status: { $in: ['waiting', 'in_consultation'] },
    })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name avatar' },
          { path: 'department', select: 'name code tokenPrefix' },
        ],
      })
      .sort({ createdAt: -1 });

    // Fallback: Check for scheduled or completed appointment today
    if (!appointment) {
      appointment = await Appointment.findOne({
        patient: req.user.id,
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['scheduled', 'completed', 'skipped'] },
      })
        .populate({
          path: 'doctor',
          populate: [
            { path: 'user', select: 'name avatar' },
            { path: 'department', select: 'name code tokenPrefix' },
          ],
        })
        .sort({ createdAt: -1 });
    }

    if (!appointment) {
      return sendSuccess(res, { activeQueue: null });
    }

    if (!appointment.tokenNumber) {
      return sendSuccess(res, {
        activeQueue: {
          hasToken: false,
          appointment,
        },
      });
    }

    const queue = await getOrCreateTodayQueue(appointment.doctor._id);
    const enriched = enrichQueueWithMetrics(
      queue,
      appointment.doctor.avgConsultationMinutes || 15
    );

    // Find this patient's token entry in enriched queue
    const myTokenEntry = enriched.tokens.find(
      (t) => t.tokenNumber === appointment.tokenNumber
    );

    return sendSuccess(res, {
      activeQueue: {
        hasToken: true,
        appointment,
        token: myTokenEntry || {
          tokenNumber: appointment.tokenNumber,
          status: appointment.status,
          patientsAhead: 0,
          estimatedWaitMinutes: 0,
        },
        currentServingToken: enriched.currentServingToken,
        currentServingPatient: enriched.currentServingPatient,
        totalWaiting: enriched.totalWaiting,
        doctor: {
          id: appointment.doctor._id,
          name: appointment.doctor.user?.name,
          specialization: appointment.doctor.specialization,
          roomNumber: appointment.doctor.roomNumber,
          department: appointment.doctor.department?.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Call next patient in doctor's queue
// @route   POST /api/queue/call-next
// @access  Private (Doctor)
const callNext = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return sendError(res, 'Doctor profile not found', 404);
    }

    const { tokenId } = req.body || {};
    let result;
    if (tokenId) {
      result = await callSpecificPatient(doctor._id, tokenId);
    } else {
      result = await callNextPatient(doctor._id);
    }
    return sendSuccess(res, result, `Called patient with Token ${result.token.tokenNumber}`);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

// @desc    Start consultation for a token
// @route   POST /api/queue/start-consultation/:tokenId
// @access  Private (Doctor)
const startConsult = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return sendError(res, 'Doctor profile not found', 404);
    }

    const result = await startConsultation(doctor._id, req.params.tokenId);
    return sendSuccess(res, result, 'Consultation marked as started');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

// @desc    Complete consultation for a token
// @route   POST /api/queue/complete/:tokenId
// @access  Private (Doctor)
const completeConsult = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return sendError(res, 'Doctor profile not found', 404);
    }

    const { prescription, notes } = req.body;
    const result = await completeConsultation(doctor._id, req.params.tokenId, {
      prescription,
      notes,
    });
    return sendSuccess(res, result, 'Consultation completed successfully');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

// @desc    Skip a patient
// @route   POST /api/queue/skip/:tokenId
// @access  Private (Doctor)
const skip = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });
    if (!doctor) {
      return sendError(res, 'Doctor profile not found', 404);
    }

    const { reason } = req.body;
    const result = await skipPatient(doctor._id, req.params.tokenId, reason);
    return sendSuccess(res, result, 'Patient marked as skipped');
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

module.exports = {
  getDoctorQueue,
  getPatientQueueStatus,
  callNext,
  startConsult,
  completeConsult,
  skip,
};
