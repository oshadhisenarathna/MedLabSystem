import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { reportService } from '../../services/reportService'
import { portalService } from '../../services/portalService'
import ResultFlagBadge from '../../components/common/ResultFlagBadge'
import StatusBadge from '../../components/common/StatusBadge'
import ErrorAlert from '../../components/common/ErrorAlert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function ReleaseReportPage() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [report, setReport]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [releasing, setReleasing] = useState(false)
  const [released, setReleased]   = useState(false)
  const [releasedReport, setReleasedReport] = useState(null)
  const [error, setError]       = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    reportService.getPending()
      .then(list => {
        const found = list.find(r => String(r.reportId) === String(id))
        if (found) {
          if (found.status !== 'VERIFIED') {
            setError(`This report is in ${found.status} status — only VERIFIED reports can be released.`)
          }
          setReport(found)
        } else {
          setError('Report not found in the queue.')
        }
      })
      .catch(() => setError('Failed to load report data.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleRelease() {
    setReleasing(true); setError('')
    try {
      const updated = await reportService.release(id)
      setReleasedReport(updated)
      setReleased(true)
    } catch (e) {
      setError(e?.response?.data?.message || 'Release failed. Please try again.')
    } finally { setReleasing(false) }
  }

  async function handleOpenPdf() {
    if (!releasedReport?.pdfUrl) return
    setPdfLoading(true)
    try { await portalService.openPdf(releasedReport.pdfUrl) }
    catch { setError('Could not open PDF.') }
    finally { setPdfLoading(false) }
  }

  if (loading) return <LoadingSpinner />

  if (released && releasedReport) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="card text-center" style={{ padding: '40px 32px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', border: '3px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <i className="bi bi-check-circle-fill" style={{ fontSize: 34, color: '#22c55e' }} />
          </div>
          <h4 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Report Released!</h4>
          <p style={{ color: '#64748b', fontSize: 14, marginBottom: 4 }}>
            The lab report for <strong>{releasedReport.patientName}</strong> has been released.
          </p>
          <p style={{ color: '#64748b', fontSize: 13 }}>
            PDF generated and an SMS notification has been sent to the patient's mobile number.
          </p>

          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', margin: '16px 0', textAlign: 'left' }}>
            <div className="row g-2">
              {[
                { label: 'Patient',   value: releasedReport.patientName },
                { label: 'Test',      value: releasedReport.testName },
                { label: 'Result',    value: releasedReport.resultValue },
                { label: 'Invoice',   value: releasedReport.invoiceNo },
              ].map(({ label, value }) => (
                <div key={label} className="col-6">
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{value || '—'}</div>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Flag</div>
              <ResultFlagBadge flag={releasedReport.resultFlag} />
            </div>
          </div>

          <div className="d-flex flex-column gap-2">
            {releasedReport.pdfUrl && (
              <button
                className="btn btn-primary"
                style={{ borderRadius: 8, fontWeight: 600 }}
                onClick={handleOpenPdf}
                disabled={pdfLoading}
              >
                {pdfLoading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Opening…</>
                  : <><i className="bi bi-file-earmark-pdf me-2" />Open Report PDF</>
                }
              </button>
            )}
            <Link to="/queue" className="btn btn-light" style={{ borderRadius: 8 }}>
              <i className="bi bi-list-task me-2" />Back to Queue
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div className="page-header">
        <nav className="breadcrumb">
          <span className="breadcrumb-item">
            <Link to="/queue" style={{ color: '#64748b', textDecoration: 'none' }}>Queue</Link>
          </span>
          <span className="breadcrumb-item active">Release Report</span>
        </nav>
        <h1>Release Report</h1>
        <div className="subtitle">Generate the PDF report and make it available to the patient.</div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {report && (
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between">
            <span><i className="bi bi-file-earmark-check me-2" />Final Report Preview</span>
            <StatusBadge status={report.status} />
          </div>
          <div className="card-body">
            {/* Summary */}
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 18px', marginBottom: 20 }}>
              <div className="row g-3">
                {[
                  { label: 'PATIENT',   value: report.patientName },
                  { label: 'NIC',       value: report.patientNic },
                  { label: 'AGE',       value: `${report.patientAge} yrs` },
                  { label: 'GENDER',    value: report.patientGender || '—' },
                  { label: 'TEST',      value: report.testName },
                  { label: 'CODE',      value: report.testCode },
                  { label: 'INVOICE',   value: report.invoiceNo },
                  { label: 'REF RANGE', value: report.referenceRange || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="col-6 col-md-3">
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: '.5px' }}>{label}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Result highlight */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#fff', border: '2px solid #e2e8f0', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>RESULT VALUE</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a' }}>{report.resultValue}</div>
              </div>
              <div style={{ width: 1, height: 48, background: '#e2e8f0' }} />
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>RESULT FLAG</div>
                <ResultFlagBadge flag={report.resultFlag || 'N/A'} />
              </div>
            </div>

            {/* What happens */}
            <div className="alert alert-info d-flex gap-2 align-items-start mb-4" style={{ fontSize: 13 }}>
              <i className="bi bi-info-circle-fill flex-shrink-0 mt-1" />
              <div>
                <strong>On release:</strong>
                <ul className="mb-0 mt-1 ps-3" style={{ lineHeight: 2 }}>
                  <li>Status changes to <strong>RELEASED</strong></li>
                  <li>A PDF report is generated with lab letterhead, patient details, result, reference range, and QR code</li>
                  <li>The PDF is stored on disk and linked to this report</li>
                  <li>An SMS notification is sent to <strong>{report.patientName}'s</strong> registered mobile number</li>
                  <li>The patient can view and download the report from the Patient Portal</li>
                </ul>
              </div>
            </div>

            <div className="d-flex gap-2">
              <Link to="/queue" className="btn btn-light flex-1" style={{ borderRadius: 8 }}>
                <i className="bi bi-arrow-left me-1" />Cancel
              </Link>
              <button
                className="btn btn-success flex-1"
                style={{ borderRadius: 8, fontWeight: 600 }}
                onClick={handleRelease}
                disabled={releasing || report.status !== 'VERIFIED'}
              >
                {releasing
                  ? <><span className="spinner-border spinner-border-sm me-2" />Releasing…</>
                  : <><i className="bi bi-send me-2" />Release to Patient</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
