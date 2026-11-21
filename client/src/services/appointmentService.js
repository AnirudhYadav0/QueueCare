import api from './api';

export const appointmentService = {
  getAvailableSlots: async (doctorId, date) => {
    return await api.get('/appointments/slots', {
      params: { doctorId, date },
    });
  },

  createAppointment: async (appointmentData) => {
    return await api.post('/appointments', appointmentData);
  },

  getMyAppointments: async (params = {}) => {
    return await api.get('/appointments/my', { params });
  },

  getAppointmentById: async (id) => {
    return await api.get(`/appointments/${id}`);
  },

  cancelAppointment: async (id, reason) => {
    return await api.put(`/appointments/${id}/cancel`, { reason });
  },

  checkIn: async (id) => {
    return await api.post(`/appointments/${id}/checkin`);
  },

  checkInByQR: async ({ qrData, appointmentId, pin }) => {
    return await api.post('/appointments/qr-checkin', { qrData, appointmentId, pin });
  },
};
