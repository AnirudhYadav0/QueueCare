const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getUserNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });

    return sendSuccess(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    return sendSuccess(res, { notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id }, { isRead: true });
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
