import api from './axiosInstance';
import { getStoredPatientId, getStoredToken } from '../utils/tokenUtils';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const portalService = {
  getMyReports: () =>
    api.get('/api/portal/reports/me', {
      headers: { 'X-Patient-Id': getStoredPatientId() }
    }).then(r => r.data),

  getByQrToken: (qrToken) =>
    api.get(`/api/portal/r/${qrToken}`).then(r => r.data),

  getPdfUrl: (pdfUrl) => {
    
    const clean = pdfUrl?.startsWith('/') ? pdfUrl.substring(1) : pdfUrl;
    return `${BASE_URL}/api/portal/reports/${clean}/pdf`;
  },

  downloadPdf: async (pdfUrl) => {
    const token = getStoredToken();
    const clean = pdfUrl?.startsWith('/') ? pdfUrl.substring(1) : pdfUrl;
    const response = await api.get(`/api/portal/reports/${clean}/pdf`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lab-report.pdf';
    a.click();
    URL.revokeObjectURL(url);
  },

  openPdf: async (pdfUrl) => {
    const clean = pdfUrl?.startsWith('/') ? pdfUrl.substring(1) : pdfUrl;
    const response = await api.get(`/api/portal/reports/${clean}/pdf`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(response.data);
    window.open(url, '_blank');
  },
};
