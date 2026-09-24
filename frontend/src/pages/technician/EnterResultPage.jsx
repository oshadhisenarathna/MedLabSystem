import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { reportService } from '../../services/reportService'
import ErrorAlert from '../../components/common/ErrorAlert'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import StatusBadge from '../../components/common/StatusBadge'
import { formatDate, calcAge } from '../../utils/dateUtils'

export default function EnterResultPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [report, setReport]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [resultValue, setResultValue] = useState('')
  const [fieldError, setFieldError]   = useState('')

  useEffect(() => {
    reportService.getPending()
      .then(list => {
        const found = list.find(r => String(r.reportId) === String(id))
        if (found) setReport(found)
        else setError('Report not found or no longer pending.')
      })
      .catch(() => setError('Failed to load report data.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!resultValue.trim()) { setFieldError('Result value is required.'); return }
    setSaving(true); setError(''); setFieldError('')
    try {
      await reportService.enterResult(id, resultValue.trim())
      navigate('/queue', { state: { success: `Result entered for ${report?.testName}.` } })
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save result. Please try again.')
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="page-header">
        <nav className="breadcrumb">
          <span className="breadcrumb-item">
            <Link to="/queue" style={{ color: '#64748b', textDecoration: 'none' }}>Queue</Link>
          </span>
          <span className="breadcrumb-item active">Enter Result</span>
        </nav>
        <h1>Enter Test Result</h1>
        <div className="subtitle">Record the raw result value from the testing instrument.</div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {report && (
        <div className="row g-4">
          {/* Left – report info */}
          <div className="col-md-5">
            {/* Patient card */}
            <div className="card mb-3">
              <div className="card-header"><i className="bi bi-person me-2" />Patient</div>
              <div className="card-body">
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{report.patientName}</div>
                <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 2 }}>NIC: {report.patientNic}</div>
                <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 2 }}>
                  Age: {report.patientAge} yrs &middot; {report.patientGender || '—'}
                </div>
                <div style={{ fontSize: 12.5, color: '#64748b' }}>Invoice: {report.invoiceNo}</div>
              </div>
            </div>

            {/* Test card */}
            <div className="card">
              <div className="card-header"><i className="bi bi-capsule-pill me-2" />Test Details</div>
              <div className="card-body">
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{report.testName}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b', marginBottom: 8 }}>{report.testCode}</div>
                {report.referenceRange && (
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Normal Range</div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#15803d' }}>{report.referenceRange}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      Results outside this range will be flagged HIGH or LOW.
                    </div>
                  </div>
                )}
                <div className="mt-3">
                  <StatusBadge status={report.status} />
                </div>
              </div>
            </div>
          </div>

          {/* Right – entry form */}
          <div className="col-md-7">
            <div className="card">
              <div className="card-header"><i className="bi bi-input-cursor-text me-2" />Enter Result Value</div>
              <div className="card-body">
                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-4">
                    <label className="form-label" style={{ fontSize: 13 }}>
                      Result Value *
                    </label>
                    <input
                      type="text"
                      className={`form-control ${fieldError ? 'is-invalid' : ''}`}
                      style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', padding: '14px', letterSpacing: 2 }}
                      placeholder={report.referenceRange ? report.referenceRange.split('-')[0] + ' – ' + report.referenceRange.split('-')[1] : 'e.g. 115'}
                      value={resultValue}
                      onChange={e => { setResultValue(e.target.value); setFieldError('') }}
                      autoFocus
                    />
                    {fieldError && <div className="invalid-feedback">{fieldError}</div>}
                    <div className="form-text mt-2">
                      Enter the exact value from the instrument.
                      For non-numeric results, type the full text (e.g. <code>Positive</code>, <code>Negative</code>).
                    </div>
                  </div>

                  {/* Preview flag */}
                  {resultValue && report.referenceRange && (() => {
                    const v = parseFloat(resultValue)
                    const parts = report.referenceRange.split('-')
                    if (!isNaN(v) && parts.length === 2) {
                      const lo = parseFloat(parts[0])
                      const hi = parseFloat(parts[1])
                      if (!isNaN(lo) && !isNaN(hi)) {
                        const flag = v < lo ? 'LOW' : v > hi ? 'HIGH' : 'NORMAL'
                        const colors = { HIGH: '#b91c1c', LOW: '#b91c1c', NORMAL: '#15803d' }
                        const bgs = { HIGH: '#fef2f2', LOW: '#fef2f2', NORMAL: '#f0fdf4' }
                        return (
                          <div style={{ background: bgs[flag], border: `1px solid`, borderColor: flag === 'NORMAL' ? '#bbf7d0' : '#fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Predicted Flag</div>
                            <div style={{ fontWeight: 700, fontSize: 16, color: colors[flag] }}>
                              {flag === 'NORMAL' ? <i className="bi bi-check-circle-fill me-2" /> : <i className="bi bi-exclamation-triangle-fill me-2" />}
                              {flag}
                            </div>
                          </div>
                        )
                      }
                    }
                    return null
                  })()}

                  <div className="d-flex gap-2">
                    <Link to="/queue" className="btn btn-light flex-1" style={{ borderRadius: 8 }}>
                      <i className="bi bi-arrow-left me-1" />Cancel
                    </Link>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                      style={{ borderRadius: 8, fontWeight: 600 }}
                      disabled={saving}
                    >
                      {saving
                        ? <><span className="spinner-border spinner-border-sm me-2" />Saving…</>
                        : <><i className="bi bi-save me-2" />Save Result</>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
