import { Outlet } from 'react-router-dom';

export default function PortalLayout() {
  return (
    <div className="portal-page">
      <div className="portal-header">
        <div style={{width:32,height:32,background:'linear-gradient(135deg,#1d6fa4,#0ea5e9)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <i className="bi bi-activity text-white" />
        </div>
        <span className="portal-header-logo">MedLab Patient Portal</span>
        <div style={{marginLeft:'auto'}}>
          <span style={{color:'rgba(255,255,255,.6)',fontSize:12}}>Secure &amp; Confidential</span>
        </div>
      </div>
      <div className="portal-body">
        <Outlet />
      </div>
      <div style={{padding:'12px 32px',textAlign:'center',color:'rgba(255,255,255,.4)',fontSize:11}}>
        © {new Date().getFullYear()} MedLab Pro. All rights reserved.
      </div>
    </div>
  );
}
