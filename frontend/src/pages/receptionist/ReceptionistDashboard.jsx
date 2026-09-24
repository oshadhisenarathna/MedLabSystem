import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { appointmentService } from '../../services/appointmentService'
import { patientService } from '../../services/patientService'
import StatsCard from '../../components/common/StatsCard'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { todayISO, formatDateTime } from '../../utils/dateUtils'
import { useAuth } from '../../context/AuthContext'

export default function ReceptionistDashboard() {
  const { username } = useAuth()
  const [stats, setStats] = useState({ patients: 0, todayAppts: 0, paid: 0, unpaid: 0 })
  const [todayAppts, setTodayAppts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      patientService.getAll(),
      appointmentService.getByDate(todayISO()),
    ]).then(([patients, appts]) => {
      const p = patients.value || []
      const a = appts.value || []
      setStats({
        patients: p.length,
        todayAppts: a.length,
        paid: a.filter(x => x.paymentStatus === 'PAID').length,
        unpaid: a.filter(x => x.paymentStatus !== 'PAID').length,
      })
      setTodayAppts(a.slice(0, 8))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {username} 👋</h1>
        <div className="subtitle">Today's overview — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <StatsCard label="Total Patients" value={stats.patients} icon="bi-people-fill" bg="#eff6ff" color="#1d4ed8" />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard label="Today's Appointments" value={stats.todayAppts} icon="bi-calendar2-check-fill" bg="#f0fdf4" color="#15803d" />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard label="Payments Collected" value={stats.paid} icon="bi-check-circle-fill" bg="#f0f9ff" color="#0369a1" />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard label="Unpaid Appointments" value={stats.unpaid} icon="bi-exclamation-circle-fill" bg="#fff7ed" color="#c2410c" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Link to="/patients" style={{ textDecoration: 'none' }}>
            <div className="stats-card" style={{ cursor: 'pointer', gap: 12 }}>
              <div className="stats-icon" style={{ background: '#eff6ff' }}>
                <i className="bi bi-person-plus-fill" style={{ color: '#1d4ed8' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>Register Patient</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Add a new patient record</div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/appointments/new" style={{ textDecoration: 'none' }}>
            <div className="stats-card" style={{ cursor: 'pointer', gap: 12 }}>
              <div className="stats-icon" style={{ background: '#f0fdf4' }}>
                <i className="bi bi-plus-circle-fill" style={{ color: '#15803d' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>New Appointment</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Book tests for a patient</div>
              </div>
            </div>
          </Link>
        </div>
        <div className="col-md-4">
          <Link to="/appointments" style={{ textDecoration: 'none' }}>
            <div className="stats-card" style={{ cursor: 'pointer', gap: 12 }}>
              <div className="stats-icon" style={{ background: '#fff7ed' }}>
                <i className="bi bi-calendar2-week-fill" style={{ color: '#c2410c' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>View Appointments</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Manage today's schedule</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Today's table */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">Today's Appointments</span>
          <Link to="/appointments" className="btn btn-sm btn-light" style={{ fontSize: 12, borderRadius: 8 }}>View All</Link>
        </div>
        {todayAppts.length === 0
          ? <div className="py-4 text-center text-muted" style={{ fontSize: 13 }}>No appointments today. <Link to="/appointments/new">Book one →</Link></div>
          : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead><tr><th>Invoice</th><th>Patient</th><th>Time</th><th>Amount (Rs.)</th><th>Payment</th><th>Action</th></tr></thead>
                <tbody>
                  {todayAppts.map(a => (
                    <tr key={a.id}>
                      <td><Link to={`/appointments/${a.id}`} style={{ color: '#1d6fa4', fontWeight: 600, textDecoration: 'none' }}>{a.invoiceNo}</Link></td>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{a.patient?.name || '—'}</td>
                      <td style={{ fontSize: 12, color: '#64748b' }}>{formatDateTime(a.appointmentDate).split(',')[1] || '—'}</td>
                      <td style={{ fontWeight: 600 }}>{Number(a.totalAmount || 0).toLocaleString()}</td>
                      <td><StatusBadge paymentStatus={a.paymentStatus} /></td>
                      <td>
                        <Link to={`/appointments/${a.id}`} className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8, fontSize: 12 }}>View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  )
}
