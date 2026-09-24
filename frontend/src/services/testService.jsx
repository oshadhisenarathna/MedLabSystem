import api from './axiosInstance';


export const testService = {
  getAll:  ()         => api.get('/api/tests').then(r => r.data),
  create:  (data)     => api.post('/api/tests', data).then(r => r.data),
  update:  (id, data) => api.put(`/api/tests/${id}`, data).then(r => r.data),
  getById: (id)       => api.get(`/api/tests/${id}`).then(r => r.data),
};
