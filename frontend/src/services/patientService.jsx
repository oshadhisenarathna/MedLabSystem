import api from './axiosInstance';

export const patientService = {
  
  register: (data) => api.post('/api/patients/register', data).then(r => r.data),

  
  getAll:   ()     => api.get('/api/patients').then(r => r.data),

  
  getById:  (id)   => {
    if (!id || id === 'undefined') {
      console.error("🚨 patientService.getById: Invalid or undefined Patient ID passed!", id);
      return Promise.reject(new Error("Invalid Patient ID"));
    }
    return api.get(`/api/patients/${id}`).then(r => r.data);
  },

  
  getByNic: (nic)  => {
    if (!nic || nic === 'undefined') {
      console.error("🚨 patientService.getByNic: Invalid or undefined NIC passed!", nic);
      return Promise.reject(new Error("Invalid NIC"));
    }
    return api.get(`/api/patients/nic/${encodeURIComponent(nic)}`).then(r => r.data);
  },
};