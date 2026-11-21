import api from './api';

export const queueService = {
  getDoctorQueue: async (doctorId) => {
    return await api.get(`/queue/doctor/${doctorId}`);
  },

  getPatientQueueStatus: async () => {
    return await api.get('/queue/patient/status');
  },

  callNext: async () => {
    return await api.post('/queue/call-next');
  },

  startConsultation: async (tokenId) => {
    return await api.post(`/queue/start-consultation/${tokenId}`);
  },

  completeConsultation: async (tokenId, { prescription, notes }) => {
    return await api.post(`/queue/complete/${tokenId}`, { prescription, notes });
  },

  skipPatient: async (tokenId, reason) => {
    return await api.post(`/queue/skip/${tokenId}`, { reason });
  },
};
