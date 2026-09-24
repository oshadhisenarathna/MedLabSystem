import api from './axiosInstance';

export const appointmentService = {
  // create a appointment
  create: (data) => api.post('/api/appointments', data).then(r => r.data),

  
  getById: (id) => {
    if (!id || id === 'undefined') {
      console.error("🚨 appointmentService.getById: Invalid or undefined ID passed!", id);
      return Promise.reject(new Error("Invalid Appointment ID"));
    }
    return api.get(`/api/appointments/${id}`).then(r => r.data);
  },

  
  markPaid: (id) => {
    if (!id || id === 'undefined') {
      console.error("🚨 appointmentService.markPaid: Invalid or undefined ID passed!", id);
      return Promise.reject(new Error("Invalid Appointment ID for payment"));
    }
    return api.patch(`/api/appointments/${id}/pay`).then(r => r.data);
  },

  
  getByPatient: (patientId) => {
    if (!patientId || patientId === 'undefined') {
      console.error("🚨 appointmentService.getByPatient: Invalid or undefined patientId passed!", patientId);
      return Promise.reject(new Error("Invalid Patient ID"));
    }
    return api.get(`/api/appointments/patient/${patientId}`).then(r => r.data);
  },

  
  getByDate: (date) => api.get(`/api/appointments/date`, { params: { date } }).then(r => r.data),
};