const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Clinic name is required'],
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Smart Healthcare & Fast-Track Queue Care',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      default: 'Metro City',
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
    },
    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '20:00' },
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    },
    slotDurationMinutes: {
      type: Number,
      default: 15,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Clinic', clinicSchema);
