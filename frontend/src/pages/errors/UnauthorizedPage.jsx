import { Link } from 'react-router-dom';
export default function UnauthorizedPage() {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#f0f4f8',textAlign:'center',padding:24}}>
      <i className="bi bi-shield-exclamation" style={{fontSize:64,color:'#ef4444',opacity:.7}} />
      <h2 style={{fontWeight:700,color:'#0f172a',marginTop:16}}>Access Denied</h2>
      <p className="text-muted" style={{fontSize:14}}>You don't have permission to access this page.</p>
      <Link to="/dashboard" className="btn btn-primary mt-2" style={{borderRadius:8}}>
        <i className="bi bi-arrow-left me-2" />Back to Dashboard
      </Link>
    </div>
  );
}
