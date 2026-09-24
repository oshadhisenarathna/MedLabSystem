import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { reportService } from '../../services/reportService'
import ResultFlagBadge from '../../components/common/ResultFlagBadge'
import StatusBadge from '../../components/common/StatusBadge'
import ErrorAlert from '../../components/common/ErrorAlert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function VerifyResultPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [report, setReport]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    reportService.getPending()
      .then(list => {
        const found = list.find(r => String(r.reportId) === String(id))
        if (found) {
          if (found.status !== 'ENTERED') {
            setError(`This report is in ${found.status} status — only ENTERED reports can be verified.`)
          }
          setReport(found)
        } else {
          setError('Report not found in the queue.')
        }
      })
      .catch(() => setError('Failed to load report data.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleVerify() {
    if (!confirmed) { setError('Please confirm that you have reviewed the result before verifying.'); return }
    setSaving(true); setError('')
    try {
      await reportService.verify(id)
      navigate('/queue', { state: { success: `Result verified for ${report?.testName}.` } })
    } catch (e) {
      setError(e?.response?.data?.message || 'Verification failed. Please try again.')
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner />

  // Compute flag for display
  function computeFlag(value, range) {
    if (!value || !range) return 'N/A'
    try {
      const v  = parseFloat(value)
      const [lo, hi] = range.split('-').map(p => parseFloat(p.replace(/[^\d.]/g, '')))
      if (isNaN(v) || isNaN(lo) || isNaN(hi)) return 'N/A'
      if (v < lo) return 'LOW'
      if (v > hi) return 'HIGH'
      return 'NORMAL'
    } catch { return 'N/A' }
  }

  const flag = report ? computeFlag(report.resultValue, report.referenceRange) : 'N/A'

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="page-header">
        <nav className="breadcrumb">
          <span className="breadcrumb-item">
            <Link to="/queue" style={{ color: '#64748b', textDecoration: 'none' }}>Queue</Link>
          </span>
          <span className="breadcrumb-item active">Verify Result</span>
        </nav>
        <h1>Verify Test Result</h1>
        <div className="subtitle">Review the entered result and approve it for release.</div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {report && (
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <span><i className="bi bi-shield-check me-2" />Result Review</span>
            <StatusBadge status={report.status} />
          </div>
          <div className="card-body">
            {/* Patient row */}
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <div className="row g-2">
                <div className="col-6">
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>PATIENT</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{report.patientName}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{report.patientNic}</div>
                </div>
                <div className="col-3">
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>AGE</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{report.patientAge} yrs</div>
                </div>
                <div className="col-3">
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>GENDER</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{report.patientGender || '—'}</div>
                </div>
              </div>
            </div>

            {/* Test + result highlight */}
            <div style={{ border: '2px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ background: '#0f172a', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{report.testName}</div>
                  <div style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}>{report.testCode} · {report.invoiceNo}</div>
                </div>
              </div>
              <div style={{ padding: '20px 18px' }}>
                <div className="row g-4 align-items-center">
                  <div className="col-4 text-center">
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>RESULT</div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                      {report.resultValue}
                    </div>
                  </div>
                  <div className="col-4 text-center">
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>REFERENCE RANGE</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#374151' }}>
                      {report.referenceRange || '—'}
                    </div>
                  </div>
                  <div className="col-4 text-center">
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>FLAG</div>
                    <ResultFlagBadge flag={flag} />
                  </div>
                </div>
              </div>
            </div>

            {/* Flag explanation */}
            {flag === 'HIGH' || flag === 'LOW' ? (
              <div className="alert alert-danger d-flex gap-2 align-items-start mb-4">
                <i className="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1" />
                <div>
                  <strong>Abnormal result detected.</strong> The result is <strong>{flag}</strong> compared to the normal range of <strong>{report.referenceRange}</strong>.
                  This will be highlighted in red on the printed report.
                </div>
              </div>
            ) : flag === 'NORMAL' ? (
              <div className="alert alert-success d-flex gap-2 align-items-start mb-4">
                <i className="bi bi-check-circle-fill flex-shrink-0 mt-1" />
                <div>Result is within the normal reference range.</div>
              </div>
            ) : null}

            {/* Confirmation checkbox */}
            <div
              style={{ background: confirmed ? '#f0fdf4' : '#f8fafc', border: `2px solid ${confirmed ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 10, padding: '14px 16px', marginBottom: 20, cursor: 'pointer', transition: 'all .15s' }}
              onClick={() => setConfirmed(c => !c)}
            >
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${confirmed ? '#15803d' : '#cbd5e1'}`, background: confirmed ? '#15803d' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                  {confirmed && <i className="bi bi-check" style={{ color: '#fff', fontSize: 13, fontWeight: 700 }} />}
                </div>
                <div style={{ fontSize: 13.5, fontWeight: confirmed ? 600 : 400, color: confirmed ? '#15803d' : '#374151' }}>
                  I confirm that I have reviewed this result and it is accurate. I approve it for patient release.
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Link to="/queue" className="btn btn-light flex-1" style={{ borderRadius: 8 }}>
                <i className="bi bi-arrow-left me-1" />Back
              </Link>
              <button
                className="btn btn-success flex-1"
                style={{ borderRadius: 8, fontWeight: 600 }}
                onClick={handleVerify}
                disabled={saving || !confirmed || report.status !== 'ENTERED'}
              >
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-2" />Verifying…</>
                  : <><i className="bi bi-check-circle me-2" />Verify & Approve</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
