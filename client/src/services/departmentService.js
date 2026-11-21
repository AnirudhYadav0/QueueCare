import api from './api';

export const departmentService = {
  getDepartments: async () => {
    return await api.get('/departments');
  },

  getDepartmentById: async (id) => {
    return await api.get(`/departments/${id}`);
  },

  createDepartment: async (data) => {
    return await api.post('/departments', data);
  },

  updateDepartment: async (id, data) => {
    return await api.put(`/departments/${id}`, data);
  },

  deleteDepartment: async (id) => {
    return await api.delete(`/departments/${id}`);
  },
};
