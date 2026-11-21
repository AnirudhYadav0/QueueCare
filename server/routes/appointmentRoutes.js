const express = require('express');
const router = express.Router();
const {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelAppointment,
  checkIn,
  checkInByQR,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

// Public slots check & QR check-in endpoint
router.get('/slots', getAvailableSlots);
router.post('/qr-checkin', checkInByQR);

// Protected routes
router.post('/', protect, createAppointment);
router.get('/my', protect, getMyAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/cancel', protect, cancelAppointment);
router.post('/:id/checkin', protect, checkIn);

module.exports = router;
