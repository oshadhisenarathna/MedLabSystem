import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function ChangePasswordPage() {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function validate() {
    const e = {};
    if (!form.current) e.current = 'Current password is required';
    if (!form.newPw || form.newPw.length < 6) e.newPw = 'New password must be at least 6 characters';
    if (form.newPw !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await userService.changePassword(userId, form.current, form.newPw);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 1800);
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><i className="bi bi-shield-lock" /></div>
          <div>
            <div className="auth-logo-text">Password Change Required</div>
            <div className="auth-logo-sub">First Login Security Step</div>
          </div>
        </div>

        <div className="alert alert-info d-flex gap-2 align-items-start mb-4">
          <i className="bi bi-info-circle-fill mt-1 flex-shrink-0" />
          <small>For security, you must set a new password before accessing the system. Your current password is the default one assigned by the administrator.</small>
        </div>

        {success && (
          <div className="alert alert-success d-flex gap-2 align-items-center">
            <i className="bi bi-check-circle-fill" />
            Password changed successfully! Redirecting...
          </div>
        )}

        <ErrorAlert message={serverError} onClose={() => setServerError('')} />

        <form onSubmit={handleSubmit} noValidate>
          {[
            { key:'current', label:'Current Password', placeholder:'Enter current (default) password' },
            { key:'newPw',   label:'New Password',     placeholder:'Minimum 6 characters' },
            { key:'confirm', label:'Confirm New Password', placeholder:'Re-enter new password' },
          ].map(({ key, label, placeholder }) => (
            <div className="mb-3" key={key}>
              <label className="form-label">{label}</label>
              <input
                type="password"
                className={`form-control ${errors[key] ? 'is-invalid' : ''}`}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              />
              {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
            </div>
          ))}

          <button type="submit" className="btn btn-primary w-100 mt-2" style={{borderRadius:8,padding:'10px',fontWeight:600}} disabled={loading || success}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Changing...</> : 'Change Password'}
          </button>

          <button type="button" className="btn btn-link w-100 mt-2 text-muted" style={{fontSize:12.5}} onClick={logout}>
            Sign out instead
          </button>
        </form>
      </div>
    </div>
  );
}
