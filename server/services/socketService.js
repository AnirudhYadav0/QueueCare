let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join doctor's live queue room
    socket.on('join_doctor_queue', (doctorId) => {
      if (doctorId) {
        socket.join(`queue:${doctorId}`);
        console.log(`Socket ${socket.id} joined room: queue:${doctorId}`);
      }
    });

    // Leave doctor's live queue room
    socket.on('leave_doctor_queue', (doctorId) => {
      if (doctorId) {
        socket.leave(`queue:${doctorId}`);
        console.log(`Socket ${socket.id} left room: queue:${doctorId}`);
      }
    });

    // Join patient's private notification channel
    socket.on('join_patient_channel', (patientUserId) => {
      if (patientUserId) {
        socket.join(`patient:${patientUserId}`);
        console.log(`Socket ${socket.id} joined room: patient:${patientUserId}`);
      }
    });

    // Join admin broadcast room
    socket.on('join_admin_channel', () => {
      socket.join('admin:channel');
      console.log(`Socket ${socket.id} joined admin channel`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return ioInstance;
};

const emitQueueUpdate = (doctorId, queueData) => {
  if (ioInstance && doctorId) {
    ioInstance.to(`queue:${doctorId}`).emit('queue_updated', queueData);
    // Also notify admins
    ioInstance.to('admin:channel').emit('admin_queue_update', { doctorId, queueData });
  }
};

const emitTokenCalled = (doctorId, tokenData) => {
  if (ioInstance && doctorId) {
    ioInstance.to(`queue:${doctorId}`).emit('token_called', tokenData);
  }
};

const emitPatientNotification = (patientUserId, notification) => {
  if (ioInstance && patientUserId) {
    ioInstance.to(`patient:${patientUserId}`).emit('new_notification', notification);
  }
};

const emitAdminUpdate = (event, data) => {
  if (ioInstance) {
    ioInstance.to('admin:channel').emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitQueueUpdate,
  emitTokenCalled,
  emitPatientNotification,
  emitAdminUpdate,
};
