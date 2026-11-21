const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  getMyTodayQueue,
  getMyAppointments,
  toggleAvailability,
  updateSchedule,
} = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Doctor only routes
router.get('/me/queue', protect, authorize('doctor'), getMyTodayQueue);
router.get('/me/appointments', protect, authorize('doctor'), getMyAppointments);
router.patch('/me/availability', protect, authorize('doctor'), toggleAvailability);
router.put('/me/schedule', protect, authorize('doctor'), updateSchedule);

module.exports = router;
