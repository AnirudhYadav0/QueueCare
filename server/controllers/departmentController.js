const Department = require('../models/Department');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all active departments
// @route   GET /api/departments
// @access  Public
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    return sendSuccess(res, { departments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department by ID
// @route   GET /api/departments/:id
// @access  Public
const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 'Department not found', 404);
    }
    return sendSuccess(res, { department });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, icon, tokenPrefix } = req.body;

    if (!name || !code) {
      return sendError(res, 'Department name and code are required', 400);
    }

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || '',
      icon: icon || 'HeartPulse',
      tokenPrefix: tokenPrefix ? tokenPrefix.toUpperCase() : code.slice(0, 1).toUpperCase(),
    });

    return sendSuccess(res, { department }, 'Department created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, code, description, icon, tokenPrefix, isActive } = req.body;

    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 'Department not found', 404);
    }

    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description;
    if (icon) department.icon = icon;
    if (tokenPrefix) department.tokenPrefix = tokenPrefix.toUpperCase();
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();
    return sendSuccess(res, { department }, 'Department updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return sendError(res, 'Department not found', 404);
    }

    department.isActive = false;
    await department.save();

    return sendSuccess(res, null, 'Department deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
