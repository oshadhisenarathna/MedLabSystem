import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/tokenUtils';

const NAV = {
  ADMIN: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    ]},
    { label: 'Management', items: [
      { to: '/users',    icon: 'bi-people-fill',   label: 'Staff Users' },
      { to: '/tests',    icon: 'bi-capsule-pill',  label: 'Lab Test Catalogue' },
      { to: '/patients', icon: 'bi-person-lines-fill', label: 'Patients' },
      { to: '/appointments', icon: 'bi-calendar2-week-fill', label: 'Appointments' },
    ]},
    { label: 'Reports', items: [
      { to: '/reports/release', icon: 'bi-file-earmark-medical-fill', label: 'Release Reports' },
    ]},
  ],
  RECEPTIONIST: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    ]},
    { label: 'Operations', items: [
      { to: '/patients',      icon: 'bi-person-lines-fill',    label: 'Patients' },
      { to: '/appointments/new', icon: 'bi-plus-circle-fill', label: 'New Appointment' },
      { to: '/appointments',  icon: 'bi-calendar2-week-fill',  label: 'Appointments' },
    ]},
  ],
  TECHNICIAN: [
    { label: 'Overview', items: [
      { to: '/dashboard', icon: 'bi-grid-1x2-fill', label: 'Dashboard' },
    ]},
    { label: 'Lab Work', items: [
      { to: '/queue', icon: 'bi-list-task', label: 'Pending Queue' },
    ]},
  ],
};

export default function Sidebar() {
  const { username, role, logout } = useAuth();
  const navigate = useNavigate();
  const sections = NAV[role] || [];

  return (
    <aside className="sidebar">
      <NavLink to="/dashboard" className="sidebar-brand">
        <div className="sidebar-brand-icon"><i className="bi bi-activity" /></div>
        <div>
          <div className="sidebar-brand-name">MedLab Pro</div>
          <div className="sidebar-brand-sub">Laboratory System</div>
        </div>
      </NavLink>

      <div style={{flex:1, overflowY:'auto', paddingBottom:8}}>
        {sections.map(section => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            <ul className="sidebar-nav">
              {section.items.map(item => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => isActive ? 'active' : ''}
                    end={item.to === '/dashboard'}
                  >
                    <i className={`bi ${item.icon} nav-icon`} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="sidebar-avatar">{getInitials(username || role)}</div>
          <div style={{flex:1, minWidth:0}}>
            <div className="sidebar-user-name">{username || 'User'}</div>
            <div className="sidebar-user-role">{role}</div>
          </div>
        </div>
        <button
          className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
          style={{background:'rgba(255,255,255,.07)', color:'#94a3b8', border:'none', borderRadius:8}}
          onClick={logout}
        >
          <i className="bi bi-box-arrow-right" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
