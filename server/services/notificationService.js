const Notification = require('../models/Notification');
const { emitPatientNotification } = require('./socketService');

const createNotification = async ({
  recipient,
  title,
  message,
  type = 'system',
  relatedAppointment = null,
  link = '',
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      relatedAppointment,
      link,
    });

    // Real-time dispatch via socket
    emitPatientNotification(recipient.toString(), notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };
