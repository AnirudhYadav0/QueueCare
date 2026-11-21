const Clinic = require('../models/Clinic');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get Clinic Settings / Profile
// @route   GET /api/clinic
// @access  Public
const getClinicSettings = async (req, res, next) => {
  try {
    let clinic = await Clinic.findOne();
    if (!clinic) {
      clinic = await Clinic.create({
        name: 'QueueCare Medical & Specialty Center',
        tagline: 'Healthcare Without the Waiting Room',
        address: '450 Health Avenue, Suite 100',
        city: 'Metro City',
        phone: '+1 (800) 555-CARE',
        email: 'info@queuecare.health',
        operatingHours: {
          open: '08:00',
          close: '20:00',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        },
        slotDurationMinutes: 15,
      });
    }

    return sendSuccess(res, { clinic });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Clinic Settings
// @route   PUT /api/clinic
// @access  Private (Admin)
const updateClinicSettings = async (req, res, next) => {
  try {
    const { name, tagline, address, city, phone, email, operatingHours, slotDurationMinutes } =
      req.body;

    let clinic = await Clinic.findOne();
    if (!clinic) {
      clinic = new Clinic();
    }

    if (name) clinic.name = name;
    if (tagline !== undefined) clinic.tagline = tagline;
    if (address) clinic.address = address;
    if (city) clinic.city = city;
    if (phone) clinic.phone = phone;
    if (email) clinic.email = email;
    if (operatingHours) clinic.operatingHours = operatingHours;
    if (slotDurationMinutes) clinic.slotDurationMinutes = slotDurationMinutes;

    await clinic.save();
    return sendSuccess(res, { clinic }, 'Clinic settings updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClinicSettings,
  updateClinicSettings,
};
