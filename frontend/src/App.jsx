import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layouts
import MainLayout from './layouts/MainLayout'
import PortalLayout from './layouts/PortalLayout'
import ProtectedRoute from './routes/ProtectedRoute'

// Auth
import LoginPage from './pages/auth/LoginPage'
import ChangePasswordPage from './pages/auth/ChangePasswordPage'

// Portal
import PortalLoginPage from './pages/portal/PortalLoginPage'
import PortalOtpPage from './pages/portal/PortalOtpPage'
import MyReportsPage from './pages/portal/MyReportsPage'
import QrReportViewPage from './pages/portal/QrReportViewPage'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagementPage from './pages/admin/UserManagementPage'
import LabTestCataloguePage from './pages/admin/LabTestCataloguePage'

// Receptionist
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard'
import PatientManagementPage from './pages/receptionist/PatientManagementPage'
import AppointmentBookingPage from './pages/receptionist/AppointmentBookingPage'
import AppointmentDetailPage from './pages/receptionist/AppointmentDetailPage'
import AppointmentHistoryPage from './pages/receptionist/AppointmentHistoryPage'
import PatientReportHistoryPage from './pages/receptionist/PatientReportHistoryPage'

// Technician
import TechnicianDashboard from './pages/technician/TechnicianDashboard'
import PendingQueuePage from './pages/technician/PendingQueuePage'
import EnterResultPage from './pages/technician/EnterResultPage'
import VerifyResultPage from './pages/technician/VerifyResultPage'
import ReleaseReportPage from './pages/technician/ReleaseReportPage'

// Errors
import NotFoundPage from './pages/errors/NotFoundPage'
import UnauthorizedPage from './pages/errors/UnauthorizedPage'

// 1. role ekata anuwa dashboard eka maru karanawa
function SharedDashboard() {
  const { role } = useAuth()
  if (role === 'ADMIN') return <AdminDashboard />
  if (role === 'RECEPTIONIST') return <ReceptionistDashboard />
  if (role === 'TECHNICIAN') return <TechnicianDashboard />
  return <Navigate to="/unauthorized" replace />
}

function DashboardRedirect() {
  const { role } = useAuth()
  if (role === 'ADMIN' || role === 'RECEPTIONIST' || role === 'TECHNICIAN') {
    return <Navigate to="/dashboard" replace />
  }
  if (role === 'PATIENT') return <Navigate to="/portal/my-reports" replace />
  return <Navigate to="/login" replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={isAuthenticated ? <DashboardRedirect /> : <Navigate to="/login" replace />} />

      {/* Public auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Patient portal - public entry */}
      <Route element={<PortalLayout />}>
        <Route path="/portal/login" element={<PortalLoginPage />} />
        <Route path="/portal/verify-otp" element={<PortalOtpPage />} />
        <Route path="/portal/r/:qrToken" element={<QrReportViewPage />} />
      </Route>

      {/* Patient portal - protected */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route element={<PortalLayout />}>
          <Route path="/portal/my-reports" element={<MyReportsPage />} />
        </Route>
      </Route>

      {/* ========================================================= */}
      {/* 2. hamotama podu ROUTES (ADMIN, RECEPTIONIST, TECHNICIAN)  */}
      {/* ========================================================= */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST', 'TECHNICIAN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<SharedDashboard />} />
        </Route>
      </Route>

      {/* ========================================================= */}
      {/* 3. ADMIN and RECEPTIONIST dennagema common ROUTES              */}
      {/* ========================================================= */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']} />}>
        <Route element={<MainLayout />}>
          <Route path="/patients" element={<PatientManagementPage />} />
          <Route path="/appointments" element={<AppointmentHistoryPage />} />
          <Route path="/appointments/:id" element={<AppointmentDetailPage />} />
          <Route path="/patients/:patientId/reports" element={<PatientReportHistoryPage />} />
        </Route>
      </Route>

      {/* ========================================================= */}
      {/* 4. only ADMIN ROUTES                             */}
      {/* ========================================================= */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/tests" element={<LabTestCataloguePage />} />
          <Route path="/reports/release" element={<PendingQueuePage adminRelease />} />
        </Route>
      </Route>

      {/* ========================================================= */}
      {/* 5. ONLY RECEPTIONIST ROUTES                      */}
      {/* ========================================================= */}
      <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
        <Route element={<MainLayout />}>
          <Route path="/appointments/new" element={<AppointmentBookingPage />} />
        </Route>
      </Route>

      {/* ========================================================= */}
      {/* 6.ONLY TECHNICIAN ROUTES                        */}
      {/* ========================================================= */}
      <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN']} />}>
        <Route element={<MainLayout />}>
          <Route path="/queue" element={<PendingQueuePage />} />
          <Route path="/queue/:id/enter" element={<EnterResultPage />} />
          <Route path="/queue/:id/verify" element={<VerifyResultPage />} />
          <Route path="/queue/:id/release" element={<ReleaseReportPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}