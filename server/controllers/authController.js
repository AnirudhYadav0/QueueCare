const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Register a new patient
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, gender, dateOfBirth, bloodGroup } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'Email already registered. Please log in.', 400);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'patient',
      phone: phone || '',
    });

    // Create linked Patient profile
    await Patient.create({
      user: user._id,
      gender: gender || 'Prefer not to say',
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      bloodGroup: bloodGroup || 'Unknown',
    });

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        token,
      },
      'Registration successful',
      201
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login user (Patient, Doctor, Admin)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated. Contact administration.', 403);
    }

    let extraProfile = null;
    if (user.role === 'doctor') {
      extraProfile = await Doctor.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'patient') {
      extraProfile = await Patient.findOne({ user: user._id });
    }

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          doctorProfile: user.role === 'doctor' ? extraProfile : undefined,
          patientProfile: user.role === 'patient' ? extraProfile : undefined,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let extraProfile = null;

    if (user.role === 'doctor') {
      extraProfile = await Doctor.findOne({ user: user._id }).populate('department');
    } else if (user.role === 'patient') {
      extraProfile = await Patient.findOne({ user: user._id });
    }

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        doctorProfile: user.role === 'doctor' ? extraProfile : undefined,
        patientProfile: user.role === 'patient' ? extraProfile : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar, emergencyContact, address, bloodGroup, allergies } = req.body;

    const user = await User.findById(req.user.id);
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    if (user.role === 'patient') {
      const patient = await Patient.findOne({ user: user._id });
      if (patient) {
        if (emergencyContact) patient.emergencyContact = emergencyContact;
        if (address !== undefined) patient.address = address;
        if (bloodGroup) patient.bloodGroup = bloodGroup;
        if (allergies) patient.allergies = allergies;
        await patient.save();
      }
    }

    return sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
