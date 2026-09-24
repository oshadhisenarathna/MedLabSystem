import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { patientService } from '../../services/patientService'
import { appointmentService } from '../../services/appointmentService'
import { reportService } from '../../services/reportService'
import StatsCard from '../../components/common/StatsCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { formatDateTime, todayISO } from '../../utils/dateUtils'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { username } = useAuth()
  const [stats, setStats] = useState({ patients: 0, todayAppts: 0, pendingReports: 0, releasedToday: 0 })
  const [todayAppts, setTodayAppts] = useState([])
  const [pendingReports, setPendingReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = todayISO()
    Promise.allSettled([
      patientService.getAll(),
      appointmentService.getByDate(today),
      reportService.getPending(),
    ]).then(([patients, appts, reports]) => {
      const p = patients.value || []
      const a = appts.value || []
      const r = reports.value || []
      const released = r.filter(x => x.status === 'RELEASED')
      setStats({
        patients: p.length,
        todayAppts: a.length,
        pendingReports: r.filter(x => x.status === 'PENDING').length,
        releasedToday: released.length,
      })
      setTodayAppts(a.slice(0, 6))
      setPendingReports(r.filter(x => x.status === 'PENDING').slice(0, 5))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {/* Welcome */}
      <div className="page-header">
        <h1>Good {getGreeting()}, {username || 'Admin'} 👋</h1>
        <div className="subtitle">Here's what's happening in the lab today.</div>
      </div>

      {/* Stats grid */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <StatsCard label="Total Patients" value={stats.patients} icon="bi-people-fill" bg="#eff6ff" color="#1d4ed8" />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard label="Today's Appointments" value={stats.todayAppts} icon="bi-calendar2-check-fill" bg="#f0fdf4" color="#15803d" />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard label="Pending Tests" value={stats.pendingReports} icon="bi-hourglass-split" bg="#fff7ed" color="#c2410c" />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard label="Released Today" value={stats.releasedToday} icon="bi-file-earmark-check-fill" bg="#f0f9ff" color="#0369a1" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="row g-3 mb-4">
        {[
          { to: '/users', icon: 'bi-person-plus-fill', label: 'Add Staff User', color: '#7c3aed', bg: '#faf5ff' },
          { to: '/tests', icon: 'bi-capsule-pill', label: 'Manage Lab Tests', color: '#0369a1', bg: '#f0f9ff' },
          { to: '/patients', icon: 'bi-person-lines-fill', label: 'View Patients', color: '#15803d', bg: '#f0fdf4' },
          { to: '/reports/release', icon: 'bi-file-earmark-check', label: 'Release Reports', color: '#c2410c', bg: '#fff7ed' },
        ].map(({ to, icon, label, color, bg }) => (
          <div key={to} className="col-md-3 col-6">
            <Link to={to} style={{ textDecoration: 'none' }}>
              <div className="stats-card" style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start', padding: '16px 20px' }}>
                <div className="stats-icon mb-2" style={{ background: bg, width: 40, height: 40, fontSize: 18 }}>
                  <i className={`bi ${icon}`} style={{ color }} />
                </div>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{label}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="row g-3">
        {/* Today's appointments */}
        <div className="col-md-6">
          <div className="table-card">
            <div className="table-card-header">
              <span className="table-card-title">Today's Appointments</span>
              <Link to="/appointments" className="btn btn-sm btn-light" style={{ fontSize: 12, borderRadius: 8 }}>View All</Link>
            </div>
            {todayAppts.length === 0
              ? <div className="py-4 text-center text-muted" style={{ fontSize: 13 }}>No appointments today</div>
              : (
                <table className="table table-hover mb-0">
                  <thead>
                    <tr><th>Invoice</th><th>Patient</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {todayAppts.map(a => (
                      <tr key={a.id}>
                        <td><Link to={`/appointments/${a.id}`} style={{ color: '#1d6fa4', fontWeight: 600, textDecoration: 'none' }}>{a.invoiceNo}</Link></td>
                        <td style={{ fontWeight: 500 }}>{a.patient?.name || '—'}</td>
                        <td>Rs. {Number(a.totalAmount || 0).toLocaleString()}</td>
                        <td><StatusBadge paymentStatus={a.paymentStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        </div>

        {/* Pending reports */}
        <div className="col-md-6">
          <div className="table-card">
            <div className="table-card-header">
              <span className="table-card-title">Pending Test Queue</span>
              <Link to="/reports/release" className="btn btn-sm btn-light" style={{ fontSize: 12, borderRadius: 8 }}>View Queue</Link>
            </div>
            {pendingReports.length === 0
              ? <div className="py-4 text-center text-muted" style={{ fontSize: 13 }}>No pending tests</div>
              : (
                <table className="table table-hover mb-0">
                  <thead>
                    <tr><th>Patient</th><th>Test</th><th>Invoice</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {pendingReports.map(r => (
                      <tr key={r.reportId}>
                        <td style={{ fontWeight: 500 }}>{r.patientName}</td>
                        <td>{r.testCode}</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{r.invoiceNo}</td>
                        <td><StatusBadge status={r.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
