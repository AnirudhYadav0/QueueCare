const mongoose = require('mongoose');

const queueTokenSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  tokenNumber: {
    type: String,
    required: true,
  },
  sequence: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['waiting', 'calling', 'in_consultation', 'completed', 'skipped', 'cancelled'],
    default: 'waiting',
  },
  checkInTime: {
    type: Date,
    default: Date.now,
  },
  calledAt: {
    type: Date,
    default: null,
  },
  consultationStartedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  skippedAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
});

const queueSchema = new mongoose.Schema(
  {
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
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed'],
      default: 'active',
    },
    currentServingToken: {
      type: String,
      default: null,
    },
    currentServingSequence: {
      type: Number,
      default: 0,
    },
    lastTokenSequence: {
      type: Number,
      default: 0,
    },
    tokens: [queueTokenSchema],
  },
  { timestamps: true }
);

// One queue per doctor per date
queueSchema.index({ doctor: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Queue', queueSchema);
