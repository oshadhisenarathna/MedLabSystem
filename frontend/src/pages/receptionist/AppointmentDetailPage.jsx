import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { appointmentService } from '../../services/appointmentService'
import { reportService } from '../../services/reportService'
import StatusBadge from '../../components/common/StatusBadge'
import ResultFlagBadge from '../../components/common/ResultFlagBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import { formatDateTime, formatDate, calcAge } from '../../utils/dateUtils'

export default function AppointmentDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const isNew = location.state?.newlyCreated

  const [appointment, setAppointment] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const [paySuccess, setPaySuccess] = useState(false)

  
  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid Appointment ID provided. Please go back and try again.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    appointmentService.getById(id)
      .then((appt) => {
        setAppointment(appt)
      })
      .catch(e => {
        if (e?.response?.status === 404) {
          setError('Appointment not found.')
        } else {
          setError('Failed to load appointment details.')
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  
  useEffect(() => {
    
    if (!appointment) return

    
    if (!appointment?.patient?.id || appointment.patient.id === 'undefined') {
      console.warn(" Warning: This appointment has an invalid or 'undefined' Patient ID reference:", appointment)
      setReports([]) 
      return
    }

    
    if (appointment?.invoiceNo) {
      reportService.getByPatient(appointment.patient.id)
        .then(allReports => {
          const filtered = allReports.filter(r => r.invoiceNo === appointment.invoiceNo && r.invoiceNo)
          setReports(filtered)
        })
        .catch(() => {
          console.error("Failed to load reports for this patient.")
        })
    }
  }, [appointment?.id, appointment?.invoiceNo])

  async function handleMarkPaid() {
    setPaying(true)
    try {
      const updated = await appointmentService.markPaid(id)
      setAppointment(updated)
      setPaySuccess(true)
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to mark as paid.')
    } finally { setPaying(false) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <nav className="breadcrumb">
          <span className="breadcrumb-item"><Link to="/appointments" style={{ color: '#64748b', textDecoration: 'none' }}>Appointments</Link></span>
          <span className="breadcrumb-item active">{appointment?.invoiceNo || 'Detail'}</span>
        </nav>
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <h1>{appointment?.invoiceNo || 'Appointment'}</h1>
            <div className="subtitle">{appointment && formatDateTime(appointment.appointmentDate)}</div>
          </div>
          {appointment && <StatusBadge paymentStatus={appointment.paymentStatus} />}
        </div>
      </div>

      {isNew && (
        <div className="alert alert-success d-flex gap-2 align-items-start mb-3">
          <i className="bi bi-check-circle-fill flex-shrink-0 mt-1" />
          <div>
            <strong>Appointment booked successfully!</strong> Lab reports have been created and added to the technician's pending queue.
          </div>
        </div>
      )}
      {paySuccess && (
        <div className="alert alert-success d-flex gap-2 align-items-center mb-3">
          <i className="bi bi-check-circle-fill" />Payment recorded successfully.
        </div>
      )}
      <ErrorAlert message={error} onClose={() => setError('')} />

      {appointment && (
        <div className="row g-4">
          {/* Left col */}
          <div className="col-lg-8">
            {/* Patient card */}
            <div className="card mb-4">
              <div className="card-header"><i className="bi bi-person me-2" />Patient Information</div>
              <div className="card-body">
                <div className="row g-3">
                  {[
                    { label: 'Full Name', value: appointment.patient?.name },
                    { label: 'NIC', value: appointment.patient?.nic },
                    { label: 'Mobile', value: appointment.patient?.mobile },
                    { label: 'Gender', value: appointment.patient?.gender || '—' },
                    { label: 'Date of Birth', value: formatDate(appointment.patient?.dob) },
                    { label: 'Age', value: appointment.patient?.dob ? `${calcAge(appointment.patient.dob)} years` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="col-md-4 col-6">
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{label}</div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, color: '#0f172a' }}>{value || '—'}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  {appointment.patient?.id && appointment.patient.id !== 'undefined' ? (
                    <Link to={`/patients/${appointment.patient?.id}/reports`} className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8, fontSize: 12 }}>
                      <i className="bi bi-file-earmark-text me-1" />View All Patient Reports
                    </Link>
                  ) : (
                    <span className="text-danger" style={{ fontSize: 12, fontWeight: 500 }}>
                      <i className="bi bi-exclamation-triangle-fill me-1" /> Cannot view reports: Patient ID is missing or invalid in database.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Reports */}
            <div className="table-card">
              <div className="table-card-header">
                <span className="table-card-title">Test Reports</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{reports.length} test{reports.length !== 1 ? 's' : ''}</span>
              </div>
              {reports.length === 0
                ? <div className="py-4 text-center text-muted" style={{ fontSize: 13 }}>Reports loading or not yet created…</div>
                : (
                  <table className="table table-hover mb-0">
                    <thead><tr><th>Test</th><th>Code</th><th>Result</th><th>Flag</th><th>Status</th></tr></thead>
                    <tbody>
                      {reports.map(r => (
                        <tr key={r.reportId}>
                          <td style={{ fontWeight: 600, fontSize: 13 }}>{r.testName}</td>
                          <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.testCode}</td>
                          <td style={{ fontSize: 13 }}>{r.resultValue || <span style={{ color: '#94a3b8' }}>Pending</span>}</td>
                          <td>{r.resultValue ? <ResultFlagBadge flag={r.resultFlag} /> : '—'}</td>
                          <td><StatusBadge status={r.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              }
            </div>
          </div>

          {/* Right col – Invoice */}
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header"><i className="bi bi-receipt me-2" />Invoice</div>
              <div className="card-body">
                <div className="mb-3">
                  {[
                    { label: 'Invoice No.', value: appointment.invoiceNo },
                    { label: 'Date', value: formatDateTime(appointment.appointmentDate) },
                    { label: 'Receptionist', value: appointment.receptionist?.name || appointment.receptionist?.username || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: '#64748b' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{value}</span>
                    </div>
                  ))}
                </div>
                <div style={{ height: 1, background: '#f1f5f9', margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
                  <span>Total</span>
                  <span style={{ color: '#15803d' }}>Rs. {Number(appointment.totalAmount || 0).toLocaleString()}</span>
                </div>

                <div className="mb-3">
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Payment Status</div>
                  <StatusBadge paymentStatus={appointment.paymentStatus} />
                </div>

                {appointment.paymentStatus !== 'PAID' && (
                  <button
                    className="btn btn-success w-100"
                    style={{ borderRadius: 8, fontWeight: 600 }}
                    onClick={handleMarkPaid}
                    disabled={paying}
                  >
                    {paying
                      ? <><span className="spinner-border spinner-border-sm me-2" />Processing…</>
                      : <><i className="bi bi-check-circle me-2" />Mark as Paid</>
                    }
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}