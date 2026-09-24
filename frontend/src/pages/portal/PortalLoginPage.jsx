import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function PortalLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nic: '', mobile: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.nic.trim()) e.nic = 'NIC is required';
    if (!form.mobile.trim()) {
      e.mobile = 'Mobile number is required';
    } else if (!/^\+?\d{9,13}$/.test(form.mobile.trim())) {
      
      e.mobile = 'Invalid mobile number format';
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    
    const rawMobile = form.mobile.trim();
    let formattedMobile = rawMobile;

    
    if (formattedMobile.startsWith('0')) {
      formattedMobile = '+94' + formattedMobile.substring(1);
    } else if (!formattedMobile.startsWith('+')) {
      formattedMobile = '+' + formattedMobile;
    }

    const trimmedNic = form.nic.trim();

    try {
      
      await authService.requestOtp(trimmedNic, formattedMobile);
      
      
      navigate('/portal/verify-otp', { 
        state: { 
          mobile: formattedMobile, 
          nic: trimmedNic 
        } 
      });
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Unable to send OTP. Please check your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="portal-card">
      <div className="text-center mb-4">
        <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#1d6fa4,#0ea5e9)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
          <i className="bi bi-person-badge text-white" style={{fontSize:26}} />
        </div>
        <h4 style={{fontWeight:700,color:'#0f172a',marginBottom:4}}>Patient Portal</h4>
        <p style={{color:'#64748b',fontSize:13}}>Enter your NIC and registered mobile number to receive a verification code.</p>
      </div>

      <ErrorAlert message={serverError} onClose={() => setServerError('')} />

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">NIC Number</label>
          <div className="input-group">
            <span className="input-group-text bg-white" style={{borderColor:'#e2e8f0',borderRadius:'8px 0 0 8px'}}>
              <i className="bi bi-card-text text-muted" />
            </span>
            <input
              type="text"
              className={`form-control border-start-0 ${errors.nic ? 'is-invalid' : ''}`}
              style={{borderRadius:'0 8px 8px 0'}}
              placeholder="e.g. 199512345678"
              value={form.nic}
              onChange={e => setForm(f => ({...f, nic: e.target.value}))}
            />
            {errors.nic && <div className="invalid-feedback">{errors.nic}</div>}
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Registered Mobile Number</label>
          <div className="input-group">
            <span className="input-group-text bg-white" style={{borderColor:'#e2e8f0',borderRadius:'8px 0 0 8px'}}>
              <i className="bi bi-phone text-muted" />
            </span>
            <input
              type="tel"
              className={`form-control border-start-0 ${errors.mobile ? 'is-invalid' : ''}`}
              style={{borderRadius:'0 8px 8px 0'}}
              placeholder="0712345678"
              maxLength={14} 
              value={form.mobile}
              
              onChange={e => setForm(f => ({...f, mobile: e.target.value.replace(/[^\d+]/g, '')}))}
            />
            {errors.mobile && <div className="invalid-feedback">{errors.mobile}</div>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100" style={{borderRadius:8,padding:'11px',fontWeight:600}} disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Sending OTP...</> : <><i className="bi bi-send me-2" />Send Verification Code</>}
        </button>
      </form>

      <div className="mt-4 text-center">
        <a href="/login" style={{fontSize:12.5, color:'#64748b', textDecoration:'none'}}>
          <i className="bi bi-arrow-left me-1" />Staff Login
        </a>
      </div>
    </div>
  );
}