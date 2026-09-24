import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { portalService } from '../../services/portalService'
import StatusBadge from '../../components/common/StatusBadge'
import ResultFlagBadge from '../../components/common/ResultFlagBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import { formatDateTime } from '../../utils/dateUtils'

export default function MyReportsPage() {
  const { logout } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(null)

  useEffect(() => {
    portalService.getMyReports()
      .then(setReports)
      .catch(e => setError(e?.response?.data?.message || 'Failed to load reports.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleDownload(report) {
    if (!report.pdfUrl) return
    setPdfLoading(report.reportId)
    try { await portalService.openPdf(report.pdfUrl) }
    catch { setError('Could not open PDF. Please try again.') }
    finally { setPdfLoading(null) }
  }

  const released = reports.filter(r => r.status === 'RELEASED')
  const pending  = reports.filter(r => r.status !== 'RELEASED')

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>My Lab Reports</h4>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, margin: 0 }}>
            {released.length} released report{released.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <button
          onClick={logout}
          className="btn btn-sm"
          style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8 }}
        >
          <i className="bi bi-box-arrow-right me-1" />Sign Out
        </button>
      </div>

      {/* White content area */}
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px rgba(0,0,0,.1)' }}>
        <ErrorAlert message={error} onClose={() => setError('')} />

        {loading && <LoadingSpinner />}

        {!loading && reports.length === 0 && (
          <EmptyState
            icon="bi-file-earmark-medical"
            title="No reports yet"
            subtitle="Your lab reports will appear here once they are released."
          />
        )}

        {!loading && pending.length > 0 && (
          <div className="mb-4">
            <h6 style={{ fontWeight: 600, color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
              Pending / In Progress
            </h6>
            {pending.map(r => (
              <div key={r.reportId} className="report-card" style={{ opacity: .75 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="bi bi-hourglass-split" style={{ color: '#94a3b8', fontSize: 18 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{r.testName}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{r.invoiceNo}</div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}

        {!loading && released.length > 0 && (
          <div>
            <h6 style={{ fontWeight: 600, color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>
              Released Reports
            </h6>
            {released.map(r => (
              <div key={r.reportId} className="report-card">
                <div style={{ width: 44, height: 44, borderRadius: 11, background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="bi bi-file-earmark-medical" style={{ color: '#1d4ed8', fontSize: 20 }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>{r.testName}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                    {r.invoiceNo} &middot; {formatDateTime(r.issuedDate)}
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <StatusBadge status={r.status} />
                    {r.resultValue && (
                      <>
                        <span style={{ fontSize: 12, color: '#374151' }}>
                          Result: <strong>{r.resultValue}</strong>
                        </span>
                        <ResultFlagBadge flag={r.resultFlag} />
                      </>
                    )}
                    {r.referenceRange && (
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>Ref: {r.referenceRange}</span>
                    )}
                  </div>
                </div>
                <div className="d-flex flex-column gap-2 flex-shrink-0">
                  {r.pdfUrl ? (
                    <>
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ borderRadius: 8, fontSize: 12 }}
                        onClick={() => handleDownload(r)}
                        disabled={pdfLoading === r.reportId}
                      >
                        {pdfLoading === r.reportId
                          ? <span className="spinner-border spinner-border-sm" />
                          : <><i className="bi bi-eye me-1" />View PDF</>}
                      </button>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>No PDF</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
