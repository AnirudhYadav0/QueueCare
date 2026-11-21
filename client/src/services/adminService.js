import api from './api';

export const adminService = {
  getStats: async () => {
    return await api.get('/admin/stats');
  },

  getAnalytics: async () => {
    return await api.get('/admin/analytics');
  },

  getAllDoctors: async () => {
    return await api.get('/admin/doctors');
  },

  createDoctor: async (data) => {
    return await api.post('/admin/doctors', data);
  },

  updateDoctor: async (id, data) => {
    return await api.put(`/admin/doctors/${id}`, data);
  },

  deleteDoctor: async (id) => {
    return await api.delete(`/admin/doctors/${id}`);
  },

  getAllPatients: async () => {
    return await api.get('/admin/patients');
  },

  getAllAppointments: async (params = {}) => {
    return await api.get('/admin/appointments', { params });
  },

  getAllQueues: async () => {
    return await api.get('/admin/queues');
  },
};
