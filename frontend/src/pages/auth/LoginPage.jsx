import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function LoginPage() {
  const { loginStaff } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function validate() {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    if (!form.password.trim()) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      // Bachend eken ispasswordchange details gannawa
      const data = await authService.login(form.username.trim(), form.password);
      
      
      loginStaff(data);
      
      
      if (data.isPasswordChanged === false) {
        
        navigate('/change-password', { replace: true });
      } else {
        
        navigate('/dashboard', { replace: true });
      }
      
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Invalid username or password.');
    } finally {
      
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><i className="bi bi-activity" /></div>
          <div>
            <div className="auth-logo-text">MedLab Pro</div>
            <div className="auth-logo-sub">Laboratory Management System</div>
          </div>
        </div>

        <h5 className="fw-700 mb-1" style={{fontSize:18,fontWeight:700}}>Welcome back</h5>
        <p className="text-muted mb-4" style={{fontSize:13}}>Sign in to your staff account</p>

        <ErrorAlert message={serverError} onClose={() => setServerError('')} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-white" style={{borderColor:'#e2e8f0',borderRadius:'8px 0 0 8px'}}>
                <i className="bi bi-person text-muted" />
              </span>
              <input
                type="text"
                className={`form-control border-start-0 ${errors.username ? 'is-invalid' : ''}`}
                style={{borderRadius:'0 8px 8px 0'}}
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(f => ({...f, username: e.target.value}))}
                autoComplete="username"
              />
              {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white" style={{borderColor:'#e2e8f0',borderRadius:'8px 0 0 8px'}}>
                <i className="bi bi-lock text-muted" />
              </span>
              <input
                type={showPass ? 'text' : 'password'}
                className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({...f, password: e.target.value}))}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-group-text bg-white"
                style={{borderColor:'#e2e8f0',borderRadius:'0 8px 8px 0',cursor:'pointer'}}
                onClick={() => setShowPass(s => !s)}
              >
                <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-muted`} />
              </button>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{borderRadius:8, padding:'10px', fontWeight:600}}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</>
              : <><i className="bi bi-box-arrow-in-right me-2" />Sign In</>
            }
          </button>
        </form>

        <div className="mt-4 pt-3 border-top text-center">
          <a href="/portal/login" className="text-decoration-none" style={{fontSize:12.5, color:'#1d6fa4'}}>
            <i className="bi bi-person-circle me-1" />Patient Portal Login
          </a>
        </div>
      </div>
    </div>
  );
}
