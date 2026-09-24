import { jwtDecode } from 'jwt-decode';

export const decodeToken = (token) => { try { return jwtDecode(token); } catch { return null; } };
export const getStoredToken = () => localStorage.getItem('lab_token');
export const getStoredRole = () => localStorage.getItem('lab_role');
export const getStoredUserId = () => { const v = localStorage.getItem('lab_userId'); return v ? Number(v) : null; };
export const getStoredUsername = () => localStorage.getItem('lab_username');
export const getStoredPatientId = () => { const v = localStorage.getItem('lab_patientId'); return v ? Number(v) : null; };
export const isTokenExpired = (token) => { if (!token) return true; const d = decodeToken(token); return !d?.exp || Date.now() / 1000 > d.exp; };
export const getInitials = (name = '') => name.split(' ').slice(0,2).map(w => w[0]?.toUpperCase()).join('') || '?';

export function saveStaffSession(authResponse) {
  const { token, username, role } = authResponse;
  const decoded = decodeToken(token);
  localStorage.setItem('lab_token', token);
  localStorage.setItem('lab_username', username);
  localStorage.setItem('lab_role', role);
  if (decoded?.userId) localStorage.setItem('lab_userId', String(decoded.userId));
}

export function savePatientSession(token) {
  const decoded = decodeToken(token);
  localStorage.setItem('lab_token', token);
  localStorage.setItem('lab_role', 'PATIENT');
  if (decoded?.patientId) localStorage.setItem('lab_patientId', String(decoded.patientId));
}

export function clearSession() {
  ['lab_token','lab_username','lab_role','lab_userId','lab_patientId'].forEach(k => localStorage.removeItem(k));
}
