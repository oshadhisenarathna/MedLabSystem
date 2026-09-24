import api from './axiosInstance';

export const authService = {
  login: (username, password) =>
    api.post('/api/auth/login', { username, password }).then(r => r.data),

  requestOtp: (nic, mobile) =>
    api.post('/api/auth/request-otp', { nic, mobile }).then(r => r.data),

  
  verifyOtp: (nic, otp) =>
    api.post('/api/auth/verify-otp', { nic, otp }).then(r => r.data),

  
  changePassword: (userId, currentPassword, newPassword) =>
    api.post(`/api/auth/users/${userId}/change-password`, { currentPassword, newPassword }).then(r => r.data),
};