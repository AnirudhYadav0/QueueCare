const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Queue = require('../models/Queue');
const { getTodayNormalized, enrichQueueWithMetrics } = require('../services/queueEngine');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get Admin Dashboard Overview Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const today = getTodayNormalized();
    const endOfToday = new Date(today);
    endOfToday.setUTCHours(23, 59, 59, 999);

    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      waitingCount,
      completedTodayCount,
      cancelledCount,
      departments,
    ] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Doctor.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lte: endOfToday },
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lte: endOfToday },
        status: 'waiting',
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lte: endOfToday },
        status: 'completed',
      }),
      Appointment.countDocuments({
        appointmentDate: { $gte: today, $lte: endOfToday },
        status: 'cancelled',
      }),
      Department.find({ isActive: true }).select('name code icon'),
    ]);

    // Active queues count
    const activeQueues = await Queue.countDocuments({
      date: today,
      status: 'active',
    });

    return sendSuccess(res, {
      totalPatients,
      totalDoctors,
      todayAppointments,
      waitingCount,
      completedTodayCount,
      cancelledCount,
      activeQueues,
      departmentsCount: departments.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Detailed Analytics for Charts
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAnalytics = async (req, res, next) => {
  try {
    const today = getTodayNormalized();

    // 1. Appointments by Day (Last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const appointmentsLast7Days = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$appointmentDate' },
          },
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format for 7 days guaranteed
    const daysMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[key] = { date: key, day: dayName, count: 0, completed: 0, cancelled: 0 };
    }

    appointmentsLast7Days.forEach((item) => {
      if (daysMap[item._id]) {
        daysMap[item._id].count = item.count;
        daysMap[item._id].completed = item.completed;
        daysMap[item._id].cancelled = item.cancelled;
      }
    });

    const appointmentsByDay = Object.values(daysMap);

    // 2. Status Distribution
    const statusDistributionRaw = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusColors = {
      scheduled: '#3b82f6',
      waiting: '#f59e0b',
      in_consultation: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444',
      skipped: '#6b7280',
    };

    const statusDistribution = statusDistributionRaw.map((item) => ({
      name: item._id
        ? item._id.charAt(0).toUpperCase() + item._id.slice(1).replace('_', ' ')
        : 'Unknown',
      value: item.count,
      color: statusColors[item._id] || '#94a3b8',
    }));

    // 3. Department Volume
    const departmentPerformance = await Appointment.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'dept',
        },
      },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$dept.name',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]).then((res) =>
      res.map((r) => ({
        name: r._id || 'General',
        appointments: r.count,
      }))
    );

    // 4. Hourly Patient Traffic (Standard clinic distribution)
    const hourlyTraffic = [
      { time: '09:00 AM', patients: 14, avgWait: 12 },
      { time: '10:00 AM', patients: 22, avgWait: 18 },
      { time: '11:00 AM', patients: 28, avgWait: 24 },
      { time: '12:00 PM', patients: 19, avgWait: 15 },
      { time: '01:00 PM', patients: 8, avgWait: 8 },
      { time: '02:00 PM', patients: 17, avgWait: 14 },
      { time: '03:00 PM', patients: 24, avgWait: 20 },
      { time: '04:00 PM', patients: 16, avgWait: 15 },
      { time: '05:00 PM', patients: 9, avgWait: 10 },
    ];

    return sendSuccess(res, {
      appointmentsByDay,
      statusDistribution,
      departmentPerformance,
      hourlyTraffic,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all doctors for admin management
// @route   GET /api/admin/doctors
// @access  Private (Admin)
const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email phone avatar isActive')
      .populate('department', 'name code tokenPrefix')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { doctors });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new doctor account & profile
// @route   POST /api/admin/doctors
// @access  Private (Admin)
const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      departmentId,
      specialization,
      qualification,
      roomNumber,
      consultationFee,
      avgConsultationMinutes,
      workingHours,
    } = req.body;

    if (!name || !email || !password || !departmentId || !specialization || !roomNumber) {
      return sendError(
        res,
        'Name, email, password, department, specialization, and room number are required',
        400
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'User with this email already exists', 400);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'doctor',
      phone: phone || '',
    });

    const doctor = await Doctor.create({
      user: user._id,
      department: departmentId,
      specialization,
      qualification: qualification || 'MD, MBBS',
      roomNumber,
      consultationFee: consultationFee || 50,
      avgConsultationMinutes: avgConsultationMinutes || 15,
      workingHours: workingHours || {
        start: '09:00',
        end: '17:00',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    });

    const populated = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name code');

    return sendSuccess(res, { doctor: populated }, 'Doctor successfully created', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/admin/doctors/:id
// @access  Private (Admin)
const updateDoctor = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      departmentId,
      specialization,
      qualification,
      roomNumber,
      consultationFee,
      avgConsultationMinutes,
      isAvailable,
      isActive,
      workingHours,
    } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return sendError(res, 'Doctor not found', 404);
    }

    if (name || phone !== undefined || isActive !== undefined) {
      const user = await User.findById(doctor.user);
      if (user) {
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (isActive !== undefined) user.isActive = isActive;
        await user.save();
      }
    }

    if (departmentId) doctor.department = departmentId;
    if (specialization) doctor.specialization = specialization;
    if (qualification) doctor.qualification = qualification;
    if (roomNumber) doctor.roomNumber = roomNumber;
    if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
    if (avgConsultationMinutes !== undefined)
      doctor.avgConsultationMinutes = avgConsultationMinutes;
    if (isAvailable !== undefined) doctor.isAvailable = isAvailable;
    if (workingHours) doctor.workingHours = workingHours;

    await doctor.save();

    const populated = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar isActive')
      .populate('department', 'name code');

    return sendSuccess(res, { doctor: populated }, 'Doctor updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate Doctor
// @route   DELETE /api/admin/doctors/:id
// @access  Private (Admin)
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return sendError(res, 'Doctor not found', 404);
    }

    // Deactivate linked User
    await User.findByIdAndUpdate(doctor.user, { isActive: false });
    doctor.isAvailable = false;
    await doctor.save();

    return sendSuccess(res, null, 'Doctor account deactivated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all patients for admin
// @route   GET /api/admin/patients
// @access  Private (Admin)
const getAllPatients = async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 });

    const patientProfiles = await Patient.find();
    const profileMap = {};
    patientProfiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const combined = patients.map((user) => ({
      ...user.toObject(),
      patientInfo: profileMap[user._id.toString()] || null,
    }));

    return sendSuccess(res, { patients: combined });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments for admin
// @route   GET /api/admin/appointments
// @access  Private (Admin)
const getAllAppointments = async (req, res, next) => {
  try {
    const { status, doctorId, date } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (doctorId) filter.doctor = doctorId;
    if (date) {
      const d = new Date(date);
      const startOfDay = new Date(d.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setUTCHours(23, 59, 59, 999));
      filter.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name email phone avatar')
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email' },
          { path: 'department', select: 'name code' },
        ],
      })
      .sort({ appointmentDate: -1, timeSlot: 1 });

    return sendSuccess(res, { appointments });
  } catch (error) {
    next(error);
  }
};

// @desc    Monitor all queues across all doctors today
// @route   GET /api/admin/queues
// @access  Private (Admin)
const getAllQueues = async (req, res, next) => {
  try {
    const today = getTodayNormalized();
    const queues = await Queue.find({ date: today })
      .populate({
        path: 'doctor',
        populate: [
          { path: 'user', select: 'name email avatar' },
          { path: 'department', select: 'name code tokenPrefix' },
        ],
      })
      .populate('department');

    const enrichedQueues = queues.map((q) =>
      enrichQueueWithMetrics(q, q.doctor?.avgConsultationMinutes || 15)
    );

    return sendSuccess(res, { queues: enrichedQueues });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAllPatients,
  getAllAppointments,
  getAllQueues,
};
