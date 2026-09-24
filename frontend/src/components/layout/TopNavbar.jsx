import { useAuth } from '../../context/AuthContext';

const ROLE_COLORS = { ADMIN:'#7c3aed', RECEPTIONIST:'#1d4ed8', TECHNICIAN:'#065f46' };

export default function TopNavbar({ title }) {
  const { role, username, logout } = useAuth();
  const color = ROLE_COLORS[role] || '#374151';

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        <span className={`status-pill role-${role?.toLowerCase()} me-2`} style={{fontSize:11}}>
          {role}
        </span>
        <div className="dropdown">
          <button
            className="btn btn-sm btn-light dropdown-toggle d-flex align-items-center gap-2"
            style={{borderRadius:8, fontSize:13, borderColor:'#e2e8f0'}}
            data-bs-toggle="dropdown"
          >
            <div style={{width:24,height:24,borderRadius:'50%',background:color,color:'#fff',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>
              {(username?.[0] || '?').toUpperCase()}
            </div>
            {username}
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0" style={{borderRadius:10,fontSize:13}}>
            <li><span className="dropdown-item-text text-muted" style={{fontSize:11}}>{role}</span></li>
            <li><hr className="dropdown-divider my-1" /></li>
            <li>
              <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={logout}>
                <i className="bi bi-box-arrow-right" /> Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
