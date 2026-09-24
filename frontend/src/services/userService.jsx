import api from './axiosInstance';


export const userService = {
  getAll:     ()         => api.get('/api/users').then(r => r.data),
  create:     (data)     => api.post('/api/users', data).then(r => r.data),
  deactivate: (id)       => api.patch(`/api/users/${id}/deactivate`).then(r => r.data),
  activate:   (id)       => api.patch(`/api/users/${id}/activate`).then(r => r.data),
  changePassword: (id, currentPassword, newPassword) =>
    api.post(`/api/auth/users/${id}/change-password`, { currentPassword, newPassword }).then(r => r.data),
};
