import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import TopNavbar from '../components/layout/TopNavbar';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/users': 'Staff User Management',
  '/tests': 'Lab Test Catalogue',
  '/patients': 'Patient Management',
  '/appointments': 'Appointments',
  '/appointments/new': 'New Appointment',
  '/queue': 'Pending Test Queue',
  '/reports/release': 'Release Reports',
};

function getTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith('/appointments/')) return 'Appointment Detail';
  if (pathname.startsWith('/patients/') && pathname.includes('/reports')) return 'Patient Reports';
  if (pathname.startsWith('/queue/')) return 'Test Result';
  return 'MedLab Pro';
}

export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <TopNavbar title={getTitle(pathname)} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
