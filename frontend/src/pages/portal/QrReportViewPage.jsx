import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { portalService } from '../../services/portalService'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/common/StatusBadge'
import ResultFlagBadge from '../../components/common/ResultFlagBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { formatDateTime } from '../../utils/dateUtils'

export default function QrReportViewPage() {
  const { qrToken } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, role } = useAuth()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    portalService.getByQrToken(qrToken)
      .then(setReport)
      .catch(e => setError(e?.response?.data?.message || 'Report not found for this QR code.'))
      .finally(() => setLoading(false))
  }, [qrToken])

  async function handleViewPdf() {
    if (!report?.pdfUrl) return
    setPdfLoading(true)
    try { await portalService.openPdf(report.pdfUrl) }
    catch { setError('Could not open PDF.') }
    finally { setPdfLoading(false) }
  }

  return (
    <div className="portal-card" style={{ maxWidth: 520 }}>
      {/* Logo row */}
      <div className="d-flex align-items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1d6fa4,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="bi bi-qr-code text-white" style={{ fontSize: 16 }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>MedLab Pro</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>QR Report Verification</div>
        </div>
        <div className="ms-auto">
          <span style={{ fontSize: 11, background: '#f0fdf4', color: '#15803d', padding: '2px 8px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
            <i className="bi bi-shield-check me-1" />Verified
          </span>
        </div>
      </div>

      {loading && <LoadingSpinner />}

      {error && (
        <div className="text-center py-4">
          <i className="bi bi-exclamation-triangle" style={{ fontSize: 40, color: '#ef4444', marginBottom: 12, display: 'block' }} />
          <h6 style={{ fontWeight: 600, color: '#0f172a' }}>Report Not Found</h6>
          <p style={{ color: '#64748b', fontSize: 13 }}>{error}</p>
          <a href="/portal/login" className="btn btn-primary btn-sm" style={{ borderRadius: 8 }}>Go to Patient Portal</a>
        </div>
      )}

      {!loading && report && (
        <>
          <h5 style={{ fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Lab Report</h5>

          {/* Patient info */}
          <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
            <div className="row g-2">
              {[
                { label: 'Patient Name', value: report.patientName },
                { label: 'NIC', value: report.patientNic },
                { label: 'Age / Gender', value: `${report.patientAge} yrs / ${report.patientGender || '—'}` },
                { label: 'Invoice No.', value: report.invoiceNo },
              ].map(({ label, value }) => (
                <div key={label} className="col-6">
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{value || '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Test result */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ background: '#0f172a', padding: '10px 16px' }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{report.testName}</span>
              <span style={{ marginLeft: 8, background: 'rgba(255,255,255,.15)', color: '#e2e8f0', padding: '1px 8px', borderRadius: 10, fontSize: 11 }}>{report.testCode}</span>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div className="row g-3">
                <div className="col-4">
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Result</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{report.resultValue || '—'}</div>
                </div>
                <div className="col-4">
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Reference</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{report.referenceRange || '—'}</div>
                </div>
                <div className="col-4">
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Flag</div>
                  <ResultFlagBadge flag={report.resultFlag} />
                </div>
              </div>
            </div>
          </div>

          {/* Status & date */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Status</div>
              <StatusBadge status={report.status} />
            </div>
            {report.issuedDate && (
              <div className="text-end">
                <div style={{ fontSize: 11, color: '#94a3b8' }}>Issued</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{formatDateTime(report.issuedDate)}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="d-flex gap-2">
            {report.pdfUrl && (
              <button
                className="btn btn-primary flex-1"
                style={{ borderRadius: 8, fontWeight: 600, fontSize: 13 }}
                onClick={handleViewPdf}
                disabled={pdfLoading}
              >
                {pdfLoading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-file-earmark-pdf me-2" />}
                View Full Report PDF
              </button>
            )}
            {(!isAuthenticated || role !== 'PATIENT') && (
              <a href="/portal/login" className="btn btn-outline-secondary" style={{ borderRadius: 8, fontSize: 13 }}>
                <i className="bi bi-person me-1" />Sign In
              </a>
            )}
          </div>

          <div className="mt-3 pt-3" style={{ borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              <i className="bi bi-shield-lock me-1" />This report has been digitally verified by MedLab Pro
            </span>
          </div>
        </>
      )}
    </div>
  )
}
