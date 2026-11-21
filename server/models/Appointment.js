const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required (e.g., 09:30 AM)'],
    },
    status: {
      type: String,
      enum: [
        'scheduled',
        'checked_in',
        'waiting',
        'in_consultation',
        'completed',
        'cancelled',
        'skipped',
      ],
      default: 'scheduled',
      index: true,
    },
    reason: {
      type: String,
      trim: true,
      default: 'General Consultation',
    },
    symptoms: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    prescription: {
      type: String,
      default: '',
    },
    // Dynamic Token Fields
    tokenNumber: {
      type: String,
      default: null,
      index: true,
    },
    tokenSequence: {
      type: Number,
      default: null,
    },
    checkInPin: {
      type: String,
      default: null,
    },
    qrCodeData: {
      type: String,
      default: null,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    consultationStartTime: {
      type: Date,
      default: null,
    },
    consultationEndTime: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound index to avoid duplicate booking for same doctor & slot on same date
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
