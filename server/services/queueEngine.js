const Queue = require('../models/Queue');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const { generateTokenNumber } = require('./tokenService');
const { createNotification } = require('./notificationService');
const { emitQueueUpdate, emitTokenCalled } = require('./socketService');

// Helper to normalize date to start of day
const getTodayNormalized = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const getOrCreateTodayQueue = async (doctorId) => {
  const today = getTodayNormalized();
  let queue = await Queue.findOne({ doctor: doctorId, date: today })
    .populate('doctor')
    .populate('department')
    .populate('clinic');

  if (!queue) {
    const doctor = await Doctor.findById(doctorId).populate('department');
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    queue = await Queue.create({
      doctor: doctorId,
      department: doctor.department._id,
      clinic: doctor.clinic,
      date: today,
      status: 'active',
      currentServingToken: null,
      currentServingSequence: 0,
      lastTokenSequence: 0,
      tokens: [],
    });

    queue = await Queue.findById(queue._id)
      .populate('doctor')
      .populate('department')
      .populate('clinic');
  }

  return queue;
};

// Compute dynamic metrics for all waiting tokens in a queue
const enrichQueueWithMetrics = (queue, avgConsultationMinutes = 15) => {
  const queueObj = queue.toObject ? queue.toObject() : { ...queue };
  const tokens = queueObj.tokens || [];

  const waitingTokens = tokens.filter((t) => t.status === 'waiting');
  const currentServing = tokens.find(
    (t) => t.status === 'calling' || t.status === 'in_consultation'
  );

  const enrichedTokens = tokens.map((token) => {
    let patientsAhead = 0;
    let estimatedWaitMinutes = 0;

    if (token.status === 'waiting') {
      // Count waiting tokens that have a sequence lower than this token
      patientsAhead = waitingTokens.filter((t) => t.sequence < token.sequence).length;
      if (currentServing) {
        patientsAhead += 1;
      }
      estimatedWaitMinutes = patientsAhead * avgConsultationMinutes;
    } else if (token.status === 'calling' || token.status === 'in_consultation') {
      patientsAhead = 0;
      estimatedWaitMinutes = 0;
    }

    return {
      ...token,
      patientsAhead,
      estimatedWaitMinutes,
    };
  });

  return {
    ...queueObj,
    tokens: enrichedTokens,
    totalWaiting: tokens.filter((t) => t.status === 'waiting').length,
    totalCompleted: tokens.filter((t) => t.status === 'completed').length,
    totalSkipped: tokens.filter((t) => t.status === 'skipped').length,
    totalTokens: tokens.length,
    currentServingToken: currentServing ? currentServing.tokenNumber : null,
    currentServingStatus: currentServing ? currentServing.status : null,
    currentServingPatient: currentServing ? currentServing.patientName : null,
  };
};

// Check in patient and assign dynamic token
const checkInPatient = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate('patient')
    .populate({
      path: 'doctor',
      populate: { path: 'department' },
    });

  if (!appointment) {
    throw new Error('Appointment not found');
  }

  if (appointment.status === 'completed') {
    throw new Error('This appointment has already been completed');
  }

  if (appointment.status === 'cancelled') {
    throw new Error('This appointment has been cancelled and cannot be checked in');
  }

  if (appointment.tokenNumber && appointment.status !== 'scheduled') {
    // Already checked in, return existing queue state
    const queue = await getOrCreateTodayQueue(appointment.doctor._id);
    const enriched = enrichQueueWithMetrics(
      queue,
      appointment.doctor.avgConsultationMinutes || 15
    );
    return { appointment, queue: enriched, alreadyCheckedIn: true };
  }

  // Get or initialize today's queue
  const queue = await getOrCreateTodayQueue(appointment.doctor._id);
  const nextSeq = (queue.lastTokenSequence || 0) + 1;
  const deptPrefix = appointment.doctor.department?.tokenPrefix || 'A';
  const tokenNumber = generateTokenNumber(deptPrefix, nextSeq);

  const tokenEntry = {
    appointment: appointment._id,
    patient: appointment.patient._id,
    patientName: appointment.patient.name,
    tokenNumber,
    sequence: nextSeq,
    status: 'waiting',
    checkInTime: new Date(),
  };

  queue.tokens.push(tokenEntry);
  queue.lastTokenSequence = nextSeq;
  await queue.save();

  // Update appointment
  appointment.status = 'waiting';
  appointment.tokenNumber = tokenNumber;
  appointment.tokenSequence = nextSeq;
  appointment.checkInTime = new Date();
  await appointment.save();

  const avgMinutes = appointment.doctor.avgConsultationMinutes || 15;
  const enrichedQueue = enrichQueueWithMetrics(queue, avgMinutes);

  // Send in-app notification to patient
  await createNotification({
    recipient: appointment.patient._id,
    title: 'Check-in Confirmed!',
    message: `You are checked in! Your token is ${tokenNumber}. You are in the queue for Dr. ${appointment.doctor.user?.name || 'your physician'}.`,
    type: 'queue',
    relatedAppointment: appointment._id,
    link: `/queue/${appointment.doctor._id}`,
  });

  // Broadcast real-time update to doctor and waiting room
  emitQueueUpdate(appointment.doctor._id.toString(), enrichedQueue);

  return { appointment, queue: enrichedQueue, tokenNumber, sequence: nextSeq };
};

// Call the next waiting patient
const callNextPatient = async (doctorId) => {
  const queue = await getOrCreateTodayQueue(doctorId);
  const doctor = await Doctor.findById(doctorId).populate('user');

  // Find next token in 'waiting' status
  const nextToken = queue.tokens.find((t) => t.status === 'waiting');
  if (!nextToken) {
    throw new Error('No waiting patients in queue');
  }

  // If there was an existing calling token that wasn't started, keep it or handle
  queue.tokens.forEach((t) => {
    if (t.status === 'calling') {
      t.status = 'waiting'; // revert previous un-started call
    }
  });

  nextToken.status = 'calling';
  nextToken.calledAt = new Date();
  queue.currentServingToken = nextToken.tokenNumber;
  queue.currentServingSequence = nextToken.sequence;
  await queue.save();

  // Update appointment status
  await Appointment.findByIdAndUpdate(nextToken.appointment, {
    status: 'waiting',
  });

  const avgMinutes = doctor?.avgConsultationMinutes || 15;
  const enrichedQueue = enrichQueueWithMetrics(queue, avgMinutes);

  // Notify the patient
  await createNotification({
    recipient: nextToken.patient,
    title: 'Your Turn! Token Called',
    message: `Token ${nextToken.tokenNumber}: Please proceed immediately to Consultation Room ${doctor?.roomNumber || '1'}. Dr. ${doctor?.user?.name || ''} is ready.`,
    type: 'queue',
    relatedAppointment: nextToken.appointment,
    link: `/queue/${doctorId}`,
  });

  // Socket broadcast
  emitTokenCalled(doctorId.toString(), {
    tokenNumber: nextToken.tokenNumber,
    patientName: nextToken.patientName,
    roomNumber: doctor?.roomNumber || '1',
    doctorName: doctor?.user?.name || 'Doctor',
  });
  emitQueueUpdate(doctorId.toString(), enrichedQueue);

  return { token: nextToken, queue: enrichedQueue };
};

// Start consultation with called patient
const startConsultation = async (doctorId, tokenId) => {
  const queue = await getOrCreateTodayQueue(doctorId);
  const token = queue.tokens.id(tokenId);

  if (!token) {
    throw new Error('Queue token not found');
  }

  token.status = 'in_consultation';
  token.consultationStartedAt = new Date();
  queue.currentServingToken = token.tokenNumber;
  queue.currentServingSequence = token.sequence;
  await queue.save();

  await Appointment.findByIdAndUpdate(token.appointment, {
    status: 'in_consultation',
    consultationStartTime: new Date(),
  });

  const doctor = await Doctor.findById(doctorId);
  const avgMinutes = doctor?.avgConsultationMinutes || 15;
  const enrichedQueue = enrichQueueWithMetrics(queue, avgMinutes);

  await createNotification({
    recipient: token.patient,
    title: 'Consultation In Progress',
    message: `Consultation started for token ${token.tokenNumber}.`,
    type: 'appointment',
    relatedAppointment: token.appointment,
  });

  emitQueueUpdate(doctorId.toString(), enrichedQueue);
  return { token, queue: enrichedQueue };
};

// Complete consultation
const completeConsultation = async (doctorId, tokenId, { prescription = '', notes = '' } = {}) => {
  const queue = await getOrCreateTodayQueue(doctorId);
  const token = queue.tokens.id(tokenId);

  if (!token) {
    throw new Error('Queue token not found');
  }

  token.status = 'completed';
  token.completedAt = new Date();
  token.notes = notes;

  // Clear current serving if it was this token
  if (queue.currentServingToken === token.tokenNumber) {
    queue.currentServingToken = null;
  }
  await queue.save();

  await Appointment.findByIdAndUpdate(token.appointment, {
    status: 'completed',
    consultationEndTime: new Date(),
    prescription,
    notes,
  });

  const doctor = await Doctor.findById(doctorId);
  const avgMinutes = doctor?.avgConsultationMinutes || 15;
  const enrichedQueue = enrichQueueWithMetrics(queue, avgMinutes);

  await createNotification({
    recipient: token.patient,
    title: 'Consultation Completed',
    message: `Your visit with Dr. ${doctor?.user?.name || ''} has been completed. You can view your record in your portal.`,
    type: 'appointment',
    relatedAppointment: token.appointment,
    link: `/appointments/${token.appointment}`,
  });

  emitQueueUpdate(doctorId.toString(), enrichedQueue);
  return { token, queue: enrichedQueue };
};

// Skip a patient who did not appear
const skipPatient = async (doctorId, tokenId, reason = 'Patient not present when called') => {
  const queue = await getOrCreateTodayQueue(doctorId);
  const token = queue.tokens.id(tokenId);

  if (!token) {
    throw new Error('Queue token not found');
  }

  token.status = 'skipped';
  token.skippedAt = new Date();
  token.notes = reason;

  if (queue.currentServingToken === token.tokenNumber) {
    queue.currentServingToken = null;
  }
  await queue.save();

  await Appointment.findByIdAndUpdate(token.appointment, {
    status: 'skipped',
    notes: reason,
  });

  const doctor = await Doctor.findById(doctorId);
  const avgMinutes = doctor?.avgConsultationMinutes || 15;
  const enrichedQueue = enrichQueueWithMetrics(queue, avgMinutes);

  await createNotification({
    recipient: token.patient,
    title: 'Appointment Status: Skipped',
    message: `Token ${token.tokenNumber} was marked as skipped. Please speak with reception to be re-queued.`,
    type: 'queue',
    relatedAppointment: token.appointment,
  });

  emitQueueUpdate(doctorId.toString(), enrichedQueue);
  return { token, queue: enrichedQueue };
};

module.exports = {
  getTodayNormalized,
  getOrCreateTodayQueue,
  enrichQueueWithMetrics,
  checkInPatient,
  callNextPatient,
  startConsultation,
  completeConsultation,
  skipPatient,
};
