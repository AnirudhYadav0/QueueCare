import api from './api';

export const clinicService = {
  getClinicSettings: async () => {
    return await api.get('/clinic');
  },

  updateClinicSettings: async (data) => {
    return await api.put('/clinic', data);
  },
};
