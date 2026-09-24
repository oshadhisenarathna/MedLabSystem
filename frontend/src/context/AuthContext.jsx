import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredToken, getStoredRole, getStoredUserId, getStoredUsername,
  getStoredPatientId, isTokenExpired, saveStaffSession, savePatientSession,
  clearSession, getInitials
} from '../utils/tokenUtils';

const AuthContext = createContext(null);


const normalizeRole = (rawRole) => {
  if (!rawRole) return null;
  const cleanedRole = rawRole.toUpperCase().trim();
  
  
  if (cleanedRole === 'LAB_TECHNICIAN' || cleanedRole === 'LABTECH') {
    return 'TECHNICIAN';
  }
  return cleanedRole;
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: null, role: null, userId: null, username: null, patientId: null, ready: false,
  });

  useEffect(() => {
    const token = getStoredToken();
    if (token && !isTokenExpired(token)) {
      setAuth({
        token, 
        role: normalizeRole(getStoredRole()), // 👈 මෙතනදී Role එක Format කලා
        userId: getStoredUserId(),
        username: getStoredUsername(), 
        patientId: getStoredPatientId(), 
        ready: true,
      });
    } else {
      clearSession();
      setAuth(s => ({ ...s, ready: true }));
    }
  }, []);

  const loginStaff = useCallback((authResponse) => {
    saveStaffSession(authResponse);
    const token = authResponse.token;
    setAuth({
      token, 
      role: normalizeRole(authResponse.role), 
      username: authResponse.username,
      userId: getStoredUserId(), 
      patientId: null, 
      ready: true,
    });
    return authResponse;
  }, []);

  const loginPatient = useCallback((token) => {
    savePatientSession(token);
    setAuth({
      token, role: 'PATIENT', username: null, userId: null,
      patientId: getStoredPatientId(), ready: true,
    });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAuth({ token: null, role: null, userId: null, username: null, patientId: null, ready: true });
    window.location.href = '/login';
  }, []);

  const isAuthenticated = !!auth.token && !isTokenExpired(auth.token);

  return (
    <AuthContext.Provider value={{ ...auth, isAuthenticated, loginStaff, loginPatient, logout, getInitials }}>
      {auth.ready ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}