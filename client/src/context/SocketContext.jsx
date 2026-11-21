import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected:', socketInstance.id);
      setConnected(true);

      // Auto join user channels
      if (user?.id) {
        if (user.role === 'patient') {
          socketInstance.emit('join_patient_channel', user.id);
        } else if (user.role === 'admin') {
          socketInstance.emit('join_admin_channel');
        } else if (user.role === 'doctor' && user.doctorProfile?._id) {
          socketInstance.emit('join_doctor_queue', user.doctorProfile._id);
        }
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id, user?.role]);

  const joinDoctorQueue = (doctorId) => {
    if (socket && doctorId) {
      socket.emit('join_doctor_queue', doctorId);
    }
  };

  const leaveDoctorQueue = (doctorId) => {
    if (socket && doctorId) {
      socket.emit('leave_doctor_queue', doctorId);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        joinDoctorQueue,
        leaveDoctorQueue,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context || {};
};
