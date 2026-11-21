const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
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
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    qualification: {
      type: String,
      default: 'MD, MBBS',
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    roomNumber: {
      type: String,
      required: [true, 'Consultation room number is required'],
    },
    consultationFee: {
      type: Number,
      default: 50,
    },
    avgConsultationMinutes: {
      type: Number,
      default: 15,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' },
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    },
    maxDailyTokens: {
      type: Number,
      default: 30,
    },
    bio: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
