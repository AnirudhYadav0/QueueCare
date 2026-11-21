import api from './api';

export const doctorService = {
  getDoctors: async (params = {}) => {
    return await api.get('/doctors', { params });
  },

  getDoctorById: async (id) => {
    return await api.get(`/doctors/${id}`);
  },

  getMyTodayQueue: async () => {
    return await api.get('/doctors/me/queue');
  },

  getMyAppointments: async (params = {}) => {
    return await api.get('/doctors/me/appointments', { params });
  },

  toggleAvailability: async (isAvailable) => {
    return await api.patch('/doctors/me/availability', { isAvailable });
  },

  updateSchedule: async (scheduleData) => {
    return await api.put('/doctors/me/schedule', scheduleData);
  },
};
