import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reportService } from '../../services/reportService'
import StatsCard from '../../components/common/StatsCard'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'

export default function TechnicianDashboard() {
  const { username } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    reportService.getPending()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pending  = reports.filter(r => r.status === 'PENDING')
  const entered  = reports.filter(r => r.status === 'ENTERED')

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {username} 👋</h1>
        <div className="subtitle">Lab technician workstation — your pending test queue.</div>
      </div>

      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <StatsCard
            label="Awaiting Sample"
            value={pending.length}
            icon="bi-hourglass-split"
            bg="#fff7ed" color="#c2410c"
          />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard
            label="Result Entered"
            value={entered.length}
            icon="bi-pencil-square"
            bg="#eff6ff" color="#1d4ed8"
          />
        </div>
        <div className="col-md-3 col-6">
          <StatsCard
            label="Total in Queue"
            value={reports.length}
            icon="bi-list-task"
            bg="#f0f9ff" color="#0369a1"
          />
        </div>
        <div className="col-md-3 col-6">
          <div className="stats-card" style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer' }}
            onClick={() => window.location.href = '/queue'}>
            <div className="stats-icon mb-2" style={{ background: '#f0fdf4', width: 40, height: 40, fontSize: 18 }}>
              <i className="bi bi-arrow-right-circle-fill" style={{ color: '#15803d' }} />
            </div>
            <span style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>Go to Queue</span>
            <span style={{ fontSize: 11, color: '#64748b' }}>Enter & verify results</span>
          </div>
        </div>
      </div>

      {/* Workflow guide */}
      <div className="card mb-4">
        <div className="card-header"><i className="bi bi-diagram-3 me-2" />Report Workflow</div>
        <div className="card-body">
          <div className="d-flex align-items-center gap-0 flex-wrap">
            {[
              { label: 'PENDING',  desc: 'Appointment created',   color: '#c2410c', bg: '#fff7ed', icon: 'bi-hourglass-split' },
              { label: 'ENTERED',  desc: 'Result value saved',    color: '#1d4ed8', bg: '#eff6ff', icon: 'bi-pencil-fill' },
              { label: 'VERIFIED', desc: 'Result approved',       color: '#15803d', bg: '#f0fdf4', icon: 'bi-check-circle-fill' },
              { label: 'RELEASED', desc: 'PDF generated & sent',  color: '#0369a1', bg: '#f0f9ff', icon: 'bi-file-earmark-check-fill' },
            ].map((step, i) => (
              <div key={step.label} className="d-flex align-items-center">
                <div style={{ textAlign: 'center', padding: '8px 14px' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: step.bg, margin: '0 auto 6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <i className={`bi ${step.icon}`} style={{ color: step.color, fontSize: 16 }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: step.color }}>{step.label}</div>
                  <div style={{ fontSize: 10.5, color: '#94a3b8', maxWidth: 70 }}>{step.desc}</div>
                </div>
                {i < 3 && <i className="bi bi-chevron-right" style={{ color: '#cbd5e1', fontSize: 14, margin: '0 2px' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent queue preview */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">Pending Queue Preview</span>
          <Link to="/queue" className="btn btn-sm btn-primary" style={{ borderRadius: 8 }}>
            <i className="bi bi-list-task me-1" />View Full Queue
          </Link>
        </div>
        {reports.length === 0 ? (
          <div className="py-5 text-center">
            <i className="bi bi-check-circle" style={{ fontSize: 40, color: '#22c55e', opacity: .7 }} />
            <div style={{ marginTop: 8, fontWeight: 600, color: '#15803d' }}>All clear! No pending tests.</div>
          </div>
        ) : (
          <table className="table table-hover mb-0">
            <thead>
              <tr><th>Patient</th><th>Test</th><th>Invoice</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {reports.slice(0, 8).map(r => (
                <tr key={r.reportId}>
                  <td style={{ fontWeight: 600, fontSize: 13 }}>{r.patientName}</td>
                  <td>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>{r.testName}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6, fontFamily: 'monospace' }}>{r.testCode}</span>
                  </td>
                  <td style={{ fontSize: 12.5, color: '#64748b' }}>{r.invoiceNo}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    {r.status === 'PENDING' && (
                      <Link to={`/queue/${r.reportId}/enter`} className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8, fontSize: 12 }}>
                        Enter Result
                      </Link>
                    )}
                    {r.status === 'ENTERED' && (
                      <Link to={`/queue/${r.reportId}/verify`} className="btn btn-sm btn-outline-success" style={{ borderRadius: 8, fontSize: 12 }}>
                        Verify
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
