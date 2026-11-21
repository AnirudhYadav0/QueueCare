const express = require('express');
const router = express.Router();
const { getClinicSettings, updateClinicSettings } = require('../controllers/clinicController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', getClinicSettings);
router.put('/', protect, authorize('admin'), updateClinicSettings);

module.exports = router;
