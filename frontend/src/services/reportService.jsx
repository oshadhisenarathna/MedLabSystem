import api from './axiosInstance';
import { getStoredUserId } from '../utils/tokenUtils';

export const reportService = {
  
  getPending: () => api.get('/api/reports/pending').then(r => r.data),

  
  getByPatient: (patientId) => {
    if (!patientId || patientId === 'undefined') {
      console.error("🚨 reportService.getByPatient: Invalid or undefined Patient ID passed!", patientId);
      return Promise.reject(new Error("Invalid Patient ID for reports"));
    }
    return api.get(`/api/reports/patient/${patientId}`).then(r => r.data);
  },

  
  enterResult: (id, resultValue) => {
    if (!id || id === 'undefined') {
      console.error("🚨 reportService.enterResult: Invalid or undefined Report ID passed!", id);
      return Promise.reject(new Error("Invalid Report ID"));
    }
    return api.put(`/api/reports/${id}/result`,
      { reportId: id, resultValue },
      { headers: { 'X-User-Id': getStoredUserId() } }
    ).then(r => r.data);
  },

  
  verify: (id) => {
    if (!id || id === 'undefined') {
      console.error("🚨 reportService.verify: Invalid or undefined Report ID passed!", id);
      return Promise.reject(new Error("Invalid Report ID for verification"));
    }
    return api.patch(`/api/reports/${id}/verify`, null,
      { headers: { 'X-User-Id': getStoredUserId() } }
    ).then(r => r.data);
  },

  
  release: (id) => {
    if (!id || id === 'undefined') {
      console.error("🚨 reportService.release: Invalid or undefined Report ID passed!", id);
      return Promise.reject(new Error("Invalid Report ID for release"));
    }
    return api.patch(`/api/reports/${id}/release`).then(r => r.data);
  },
};