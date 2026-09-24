import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { patientService } from '../../services/patientService'
import { testService } from '../../services/testService'
import { appointmentService } from '../../services/appointmentService'
import { useAuth } from '../../context/AuthContext'
import ErrorAlert from '../../components/common/ErrorAlert'
import LoadingSpinner from '../../components/common/LoadingSpinner'

export default function AppointmentBookingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userId } = useAuth()

  const preselectedPatient = location.state?.patient || null

  const [patients, setPatients] = useState([])
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [patientSearch, setPatientSearch] = useState(preselectedPatient?.name || '')
  const [selectedPatient, setSelectedPatient] = useState(preselectedPatient)
  const [showPatientDropdown, setShowPatientDropdown] = useState(false)
  const [selectedTestIds, setSelectedTestIds] = useState([])
  const [testSearch, setTestSearch] = useState('')

  useEffect(() => {
    Promise.all([
      patientService.getAll(),
      testService.getAll(),
    ]).then(([p, t]) => {
      setPatients(p)
      setTests(t)
    }).catch(() => setError('Failed to load data. Some features may be unavailable.'))
      .finally(() => setLoading(false))
  }, [])

  
  const filteredPatients = useMemo(() => {
    return patients.filter(p =>
      patientSearch &&
      (p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
       p.nic?.toLowerCase().includes(patientSearch.toLowerCase()) ||
       p.mobile?.includes(patientSearch))
    ).slice(0, 8)
  }, [patients, patientSearch])

  const filteredTests = useMemo(() => {
    return tests.filter(t =>
      !testSearch ||
      t.testName?.toLowerCase().includes(testSearch.toLowerCase()) ||
      t.testCode?.toLowerCase().includes(testSearch.toLowerCase())
    )
  }, [tests, testSearch])

  const selectedTests = useMemo(() => {
    return tests.filter(t => selectedTestIds.includes(t.id))
  }, [tests, selectedTestIds])

  const totalAmount = useMemo(() => {
    return selectedTests.reduce((s, t) => s + Number(t.price || 0), 0)
  }, [selectedTests])

  function toggleTest(id) {
    setSelectedTestIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!selectedPatient) { setError('Please select a patient.'); return }
    if (selectedTestIds.length === 0) { setError('Please select at least one test.'); return }
    if (!userId) { setError('Session error: missing user ID. Please log in again.'); return }

    setSaving(true); setError('')
    try {
      const res = await appointmentService.create({
        patientId: selectedPatient.id,
        testIds: selectedTestIds,
        receptionistId: userId,
      })
      
      
      const appointmentId = res?.id || res?.data?.id || res?.data;

      
      if (!appointmentId || appointmentId === 'undefined') {
        setError('Appointment created, but failed to retrieve a valid ID from the server.');
        return;
      }

      
      navigate(`/appointments/${appointmentId}`, { state: { newlyCreated: true } })
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create appointment.')
    } finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <div className="page-header">
        <nav className="breadcrumb">
          <span className="breadcrumb-item">
            <Link to="/appointments" style={{ color: '#64748b', textDecoration: 'none' }}>Appointments</Link>
          </span>
          <span className="breadcrumb-item active">New Booking</span>
        </nav>
        <h1>Book Appointment</h1>
        <div className="subtitle">Select a patient and choose the required tests.</div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} noValidate>
        <div className="row g-4">
          {/* Left: Patient + Tests */}
          <div className="col-lg-8">
            {/* Patient selection */}
            <div className="card mb-4">
              <div className="card-header">
                <i className="bi bi-person me-2" />Patient
              </div>
              <div className="card-body">
                {selectedPatient ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px' }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{selectedPatient.name}</div>
                        <div style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
                          NIC: {selectedPatient.nic} &middot; Mobile: {selectedPatient.mobile}
                          {selectedPatient.gender && ` · ${selectedPatient.gender}`}
                        </div>
                      </div>
                      <button type="button" className="btn btn-sm btn-outline-danger" style={{ borderRadius: 8 }}
                        onClick={() => { setSelectedPatient(null); setPatientSearch('') }}>
                        <i className="bi bi-x me-1" />Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="position-relative">
                    <div className="input-group">
                      <span className="input-group-text bg-white" style={{ borderColor: '#e2e8f0', borderRadius: '8px 0 0 8px' }}>
                        <i className="bi bi-search text-muted" />
                      </span>
                      <input type="text" className="form-control border-start-0"
                        style={{ borderRadius: '0 8px 8px 0' }}
                        placeholder="Type patient name, NIC, or mobile…"
                        value={patientSearch}
                        onChange={e => { setPatientSearch(e.target.value); setShowPatientDropdown(true) }}
                        onFocus={() => setShowPatientDropdown(true)}
                        onBlur={() => setTimeout(() => setShowPatientDropdown(false), 200)}
                      />
                    </div>
                    {showPatientDropdown && filteredPatients.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,.1)', maxHeight: 260, overflowY: 'auto' }}>
                        {filteredPatients.map(p => (
                          <div key={p.id}
                            style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                            className="clickable"
                            onMouseDown={() => { setSelectedPatient(p); setPatientSearch(p.name); setShowPatientDropdown(false) }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{p.name}</div>
                            <div style={{ fontSize: 11.5, color: '#64748b' }}>{p.nic} · {p.mobile}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {patientSearch && filteredPatients.length === 0 && (
                      <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                        No matching patient. <Link to="/patients" style={{ color: '#1d6fa4' }}>Register them first →</Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Test selection */}
            <div className="card">
              <div className="card-header d-flex align-items-center justify-content-between">
                <span><i className="bi bi-capsule-pill me-2" />Select Tests</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{selectedTestIds.length} selected</span>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <input type="text" className="form-control" placeholder="Search tests…"
                    value={testSearch} onChange={e => setTestSearch(e.target.value)} />
                </div>
                {tests.length === 0 ? (
                  <div className="text-center py-3 text-muted" style={{ fontSize: 13 }}>
                    No tests available. <Link to="/tests">Add tests to the catalogue →</Link>
                  </div>
                ) : (
                  <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                    {filteredTests.map(t => {
                      const checked = selectedTestIds.includes(t.id)
                      return (
                        <div key={t.id}
                          onClick={() => toggleTest(t.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                            background: checked ? '#eff6ff' : '#f8fafc',
                            border: `1px solid ${checked ? '#bfdbfe' : '#e2e8f0'}`,
                            transition: 'all .12s',
                          }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${checked ? '#1d6fa4' : '#cbd5e1'}`, background: checked ? '#1d6fa4' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .12s' }}>
                            {checked && <i className="bi bi-check" style={{ color: '#fff', fontSize: 12, fontWeight: 700 }} />}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{t.testName}</div>
                            <div style={{ fontSize: 11.5, color: '#64748b' }}>
                              <span style={{ fontFamily: 'monospace' }}>{t.testCode}</span>
                              {t.referenceRange && ` · Ref: ${t.referenceRange}`}
                            </div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: '#15803d', flexShrink: 0 }}>
                            Rs. {Number(t.price).toLocaleString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="col-lg-4">
            <div className="card" style={{ position: 'sticky', top: 20 }}>
              <div className="card-header"><i className="bi bi-receipt me-2" />Booking Summary</div>
              <div className="card-body">
                <div className="mb-3">
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 4 }}>PATIENT</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#0f172a' }}>
                    {selectedPatient ? selectedPatient.name : <span style={{ color: '#94a3b8' }}>Not selected</span>}
                  </div>
                </div>

                <div style={{ height: 1, background: '#f1f5f9', marginBottom: 12 }} />

                <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginBottom: 8 }}>SELECTED TESTS</div>
                {selectedTests.length === 0
                  ? <div style={{ fontSize: 13, color: '#94a3b8' }}>No tests selected</div>
                  : selectedTests.map(t => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ color: '#374151' }}>{t.testName}</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Rs. {Number(t.price).toLocaleString()}</span>
                    </div>
                  ))
                }

                {selectedTests.length > 0 && (
                  <>
                    <div style={{ height: 1, background: '#f1f5f9', margin: '12px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}>
                      <span>Total</span>
                      <span style={{ color: '#15803d' }}>Rs. {totalAmount.toLocaleString()}</span>
                    </div>
                  </>
                )}

                <div style={{ height: 1, background: '#f1f5f9', margin: '16px 0' }} />

                <div className="alert alert-info d-flex gap-2" style={{ fontSize: 12, padding: '8px 12px' }}>
                  <i className="bi bi-info-circle-fill flex-shrink-0 mt-1" />
                  <div>Booking creates one <strong>PENDING</strong> lab report per test, automatically added to the technician's queue.</div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mt-2"
                  style={{ borderRadius: 8, fontWeight: 600, padding: '10px' }}
                  disabled={saving || !selectedPatient || selectedTestIds.length === 0}
                >
                  {saving
                    ? <><span className="spinner-border spinner-border-sm me-2" />Booking…</>
                    : <><i className="bi bi-calendar2-check me-2" />Confirm Booking</>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}