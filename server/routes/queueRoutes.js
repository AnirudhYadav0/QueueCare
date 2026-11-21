const express = require('express');
const router = express.Router();
const {
  getDoctorQueue,
  getPatientQueueStatus,
  callNext,
  startConsult,
  completeConsult,
  skip,
} = require('../controllers/queueController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public view of live doctor queue
router.get('/doctor/:doctorId', getDoctorQueue);

// Patient view of their today's active token & queue metrics
router.get('/patient/status', protect, getPatientQueueStatus);

// Doctor live queue actions
router.post('/call-next', protect, authorize('doctor'), callNext);
router.post('/start-consultation/:tokenId', protect, authorize('doctor'), startConsult);
router.post('/complete/:tokenId', protect, authorize('doctor'), completeConsult);
router.post('/skip/:tokenId', protect, authorize('doctor'), skip);

module.exports = router;
