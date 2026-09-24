import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#f0f4f8',textAlign:'center',padding:24}}>
      <div style={{fontSize:80,opacity:.15,fontWeight:900,color:'#0f172a',lineHeight:1}}>404</div>
      <h2 style={{fontWeight:700,color:'#0f172a',marginTop:8}}>Page Not Found</h2>
      <p className="text-muted" style={{fontSize:14}}>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="btn btn-primary mt-2" style={{borderRadius:8}}>
        <i className="bi bi-arrow-left me-2" />Back to Dashboard
      </Link>
    </div>
  );
}
