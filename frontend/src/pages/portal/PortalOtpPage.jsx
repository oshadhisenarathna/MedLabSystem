import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import ErrorAlert from '../../components/common/ErrorAlert';

export default function PortalOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginPatient } = useAuth();
  const { mobile, nic } = location.state || {};

  const [digits, setDigits] = useState(['','','','','','']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const inputRefs = useRef([]);

  useEffect(() => {
    
    if (!mobile || !nic) { 
      navigate('/portal/login', { replace: true }); 
      return; 
    }
    inputRefs.current[0]?.focus();
  }, [mobile, nic, navigate]);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2,'0');
  const ss = String(secondsLeft % 60).padStart(2,'0');

  function handleDigit(idx, val) {
    const v = val.replace(/\D/g,'').slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    if (v && idx < 5) inputRefs.current[idx+1]?.focus();
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx-1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (text.length === 6) {
      setDigits(text.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  }

  async function handleVerify() {
    const otp = digits.join('');
    if (otp.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setLoading(true); setError('');
    try {
      
      const { token } = await authService.verifyOtp(nic, otp);
      loginPatient(token);
      navigate('/portal/my-reports', { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Incorrect OTP. Please try again.');
      setDigits(['','','','','','']);
      inputRefs.current[0]?.focus();
    } finally { setLoading(false); }
  }

  async function handleResend() {
    setResending(true); setError('');
    try {
      await authService.requestOtp(nic, mobile);
      setSecondsLeft(300);
      setDigits(['','','','','','']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to resend OTP.');
    } finally { setResending(false); }
  }

  return (
    <div className="portal-card">
      <div className="text-center mb-4">
        <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,#1d6fa4,#0ea5e9)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
          <i className="bi bi-shield-check text-white" style={{fontSize:26}} />
        </div>
        <h4 style={{fontWeight:700,color:'#0f172a',marginBottom:4}}>Enter Verification Code</h4>
        <p style={{color:'#64748b',fontSize:13}}>A 6-digit code was sent to<br /><strong style={{color:'#0f172a'}}>{mobile}</strong></p>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <div className="otp-input-group mb-4" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i} type="text" inputMode="numeric" maxLength={1}
            className="otp-digit" value={d}
            ref={el => inputRefs.current[i] = el}
            onChange={e => handleDigit(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
          />
        ))}
      </div>

      <div className={`text-center mb-3 ${secondsLeft === 0 ? 'text-danger' : 'text-muted'}`} style={{fontSize:13}}>
        {secondsLeft > 0
          ? <><i className="bi bi-clock me-1" />Code expires in <strong>{mm}:{ss}</strong></>
          : <strong>OTP expired. Please request a new code.</strong>
        }
      </div>

      <button
        className="btn btn-primary w-100 mb-3"
        style={{borderRadius:8,padding:'11px',fontWeight:600}}
        onClick={handleVerify}
        disabled={loading || secondsLeft === 0}
      >
        {loading ? <><span className="spinner-border spinner-border-sm me-2" />Verifying...</> : <><i className="bi bi-check-circle me-2" />Verify & Sign In</>}
      </button>

      <div className="text-center">
        <button
          className="btn btn-link text-muted p-0"
          style={{fontSize:13}}
          onClick={handleResend}
          disabled={resending || secondsLeft > 240}
        >
          {resending ? <><span className="spinner-border spinner-border-sm me-1" style={{width:12,height:12}} />Resending...</>
            : <><i className="bi bi-arrow-clockwise me-1" />Resend OTP {secondsLeft > 240 ? `(${mm}:{ss})` : ''}</>
          }
        </button>
      </div>
      <div className="mt-3 text-center">
        <a href="/portal/login" style={{fontSize:12,color:'#94a3b8',textDecoration:'none'}}>
          <i className="bi bi-arrow-left me-1" />Use different number
        </a>
      </div>
    </div>
  );
}