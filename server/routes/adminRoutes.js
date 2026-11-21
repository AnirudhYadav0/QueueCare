const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalytics,
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllPatients,
  getAllAppointments,
  getAllQueues,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All admin routes are protected and require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/doctors', getAllDoctors);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);
router.get('/patients', getAllPatients);
router.get('/appointments', getAllAppointments);
router.get('/queues', getAllQueues);

module.exports = router;
