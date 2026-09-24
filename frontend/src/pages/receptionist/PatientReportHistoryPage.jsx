import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { patientService } from '../../services/patientService'
import { reportService } from '../../services/reportService'
import { portalService } from '../../services/portalService'
import StatusBadge from '../../components/common/StatusBadge'
import ResultFlagBadge from '../../components/common/ResultFlagBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import { formatDateTime, formatDate, calcAge } from '../../utils/dateUtils'

export default function PatientReportHistoryPage() {
  const { patientId } = useParams()
  const [patient, setPatient] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(null)
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    Promise.all([
      patientService.getById(patientId),
      reportService.getByPatient(patientId),
    ]).then(([p, r]) => {
      setPatient(p)
      setReports(r)
    }).catch(e => {
      setError(e?.response?.data?.message || 'Failed to load patient reports.')
    }).finally(() => setLoading(false))
  }, [patientId])

  async function handleOpenPdf(report) {
    if (!report.pdfUrl) return
    setPdfLoading(report.reportId)
    try { await portalService.openPdf(report.pdfUrl) }
    catch { setError('Could not open PDF. Please try again.') }
    finally { setPdfLoading(null) }
  }

  const filtered = reports.filter(r =>
    filterStatus === 'ALL' || r.status === filterStatus
  )

  const grouped = filtered.reduce((acc, r) => {
    const inv = r.invoiceNo || 'Unknown'
    if (!acc[inv]) acc[inv] = []
    acc[inv].push(r)
    return acc
  }, {})

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <nav className="breadcrumb">
          <span className="breadcrumb-item">
            <Link to="/patients" style={{ color: '#64748b', textDecoration: 'none' }}>Patients</Link>
          </span>
          <span className="breadcrumb-item active">Reports</span>
        </nav>
        <h1>Patient Reports</h1>
        {patient && (
          <div className="subtitle">
            Showing all lab reports for <strong>{patient.name}</strong>
          </div>
        )}
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Patient summary card */}
      {patient && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-center">
              <div className="col-auto">
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'linear-gradient(135deg,#1d6fa4,#0ea5e9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 20, fontWeight: 700
                }}>
                  {patient.name?.[0]?.toUpperCase()}
                </div>
              </div>
              <div className="col">
                <div style={{ fontWeight: 700, fontSize: 17, color: '#0f172a' }}>{patient.name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>
                  NIC: {patient.nic} &nbsp;·&nbsp; Mobile: {patient.mobile}
                  {patient.gender && ` · ${patient.gender}`}
                  {patient.dob && ` · Age: ${calcAge(patient.dob)} yrs`}
                </div>
              </div>
              <div className="col-auto">
                <Link
                  to="/appointments/new"
                  state={{ patient }}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: 8 }}
                >
                  <i className="bi bi-plus-circle me-1" />New Appointment
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Filter:</span>
        {['ALL', 'PENDING', 'ENTERED', 'VERIFIED', 'RELEASED'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-light'}`}
            style={{ borderRadius: 20, fontSize: 12, padding: '3px 12px' }}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'ALL' ? `All (${reports.length})` : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="bi-file-earmark-medical"
          title="No reports found"
          subtitle={filterStatus !== 'ALL' ? `No ${filterStatus} reports for this patient.` : 'This patient has no lab reports yet.'}
        />
      ) : (
        Object.entries(grouped).map(([invoiceNo, invoiceReports]) => (
          <div key={invoiceNo} className="table-card mb-4">
            <div className="table-card-header">
              <div>
                <span className="table-card-title">
                  <i className="bi bi-receipt me-2" />{invoiceNo}
                </span>
                {invoiceReports[0]?.issuedDate && (
                  <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 8 }}>
                    {formatDateTime(invoiceReports[0].issuedDate)}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                {invoiceReports.length} test{invoiceReports.length !== 1 ? 's' : ''}
              </span>
            </div>

            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Test</th>
                  <th>Result</th>
                  <th>Reference</th>
                  <th>Flag</th>
                  <th>Status</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {invoiceReports.map(r => (
                  <tr key={r.reportId}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{r.testName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{r.testCode}</div>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                      {r.resultValue || <span style={{ color: '#94a3b8', fontWeight: 400 }}>—</span>}
                    </td>
                    <td style={{ fontSize: 12.5, color: '#64748b' }}>{r.referenceRange || '—'}</td>
                    <td>{r.resultValue ? <ResultFlagBadge flag={r.resultFlag} /> : '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      {r.status === 'RELEASED' && r.pdfUrl ? (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          style={{ borderRadius: 8, fontSize: 12 }}
                          onClick={() => handleOpenPdf(r)}
                          disabled={pdfLoading === r.reportId}
                        >
                          {pdfLoading === r.reportId
                            ? <span className="spinner-border spinner-border-sm" />
                            : <><i className="bi bi-file-earmark-pdf me-1" />PDF</>
                          }
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>
                          {r.status === 'RELEASED' ? 'No PDF' : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  )
}
