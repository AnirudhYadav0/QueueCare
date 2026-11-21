const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required (e.g., CARD, PEDI, ORTH)'],
      uppercase: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'HeartPulse',
    },
    clinic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Clinic',
    },
    tokenPrefix: {
      type: String,
      default: 'A',
      uppercase: true,
      maxlength: 6,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
