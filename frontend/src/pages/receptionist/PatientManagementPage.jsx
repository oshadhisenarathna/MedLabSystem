import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { patientService } from '../../services/patientService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import { formatDate, calcAge } from '../../utils/dateUtils'

const PAGE_SIZE = 10
const EMPTY_FORM = { nic: '', name: '', mobile: '', dob: '', gender: '' }

export default function PatientManagementPage() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [nicLookup, setNicLookup] = useState('')
  const [nicSearching, setNicSearching] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setPatients(await patientService.getAll()) }
    catch (e) { setError('Failed to load patients.') }
    finally { setLoading(false) }
  }

  function openModal() {
    setForm(EMPTY_FORM); setFormErrors({}); setError('')
    new window.bootstrap.Modal(document.getElementById('patientModal')).show()
  }
  function closeModal() { window.bootstrap.Modal.getInstance(document.getElementById('patientModal'))?.hide() }

  async function searchByNic() {
    if (!nicLookup.trim()) return
    setNicSearching(true)
    try {
      const p = await patientService.getByNic(nicLookup.trim())
      navigate(`/appointments/new`, { state: { patient: p } })
    } catch (e) {
      if (e?.response?.status === 404) {
        setForm(f => ({ ...f, nic: nicLookup.trim() }))
        openModal()
      } else {
        setError(e?.response?.data?.message || 'Search failed.')
      }
    } finally { setNicSearching(false) }
  }

  function validate() {
    const e = {}
    if (!form.nic.trim()) e.nic = 'NIC is required'
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.mobile.trim()) e.mobile = 'Mobile is required'
    else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = 'Mobile must be exactly 10 digits'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleCreate(ev) {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true); setError('')
    try {
      const p = await patientService.register(form)
      setPatients(ps => [p, ...ps])
      setSuccess(`Patient "${form.name}" registered successfully.`)
      closeModal()
    } catch (e) {
      setError(e?.response?.data?.message || 'Registration failed.')
    } finally { setSaving(false) }
  }

  const filtered = patients.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.nic?.toLowerCase().includes(search.toLowerCase()) ||
    p.mobile?.includes(search)
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <h1>Patient Management</h1>
        <div className="subtitle">Register new patients and manage existing patient records.</div>
      </div>

      {success && (
        <div className="alert alert-success d-flex gap-2 align-items-center mb-3">
          <i className="bi bi-check-circle-fill" />{success}
          <button className="btn-close ms-auto" style={{ fontSize: 11 }} onClick={() => setSuccess('')} />
        </div>
      )}
      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* NIC Quick Search */}
      <div className="card mb-4" style={{ background: 'linear-gradient(135deg,#eff6ff,#dbeafe)' }}>
        <div className="card-body">
          <div className="row align-items-center g-3">
            <div className="col-md-6">
              <label className="form-label" style={{ color: '#1e3a5f', fontWeight: 600 }}>Quick NIC Search</label>
              <p style={{ fontSize: 12.5, color: '#1d4ed8', margin: '0 0 8px' }}>Search by NIC to find an existing patient or register a new one.</p>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Enter NIC number…"
                  value={nicLookup} onChange={e => setNicLookup(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchByNic()} />
                <button className="btn btn-primary" onClick={searchByNic} disabled={nicSearching}>
                  {nicSearching ? <span className="spinner-border spinner-border-sm" /> : <><i className="bi bi-search me-1" />Search</>}
                </button>
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <button className="btn btn-primary" style={{ borderRadius: 8 }} onClick={openModal}>
                <i className="bi bi-person-plus me-2" />Register New Patient
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search by name, NIC, or mobile…" />
          <span style={{ fontSize: 12.5, color: '#64748b' }}>{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? <LoadingSpinner /> : (
          paged.length === 0 ? (
            <EmptyState icon="bi-people" title="No patients found"
              action={<button className="btn btn-primary btn-sm" onClick={openModal}>Register First Patient</button>} />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead><tr><th>Patient</th><th>NIC</th><th>Mobile</th><th>Age</th><th>Gender</th><th>Actions</th></tr></thead>
                  <tbody>
                    {paged.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{p.name}</div>
                          {p.dob && <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(p.dob)}</div>}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{p.nic}</td>
                        <td style={{ fontSize: 13 }}>{p.mobile}</td>
                        <td style={{ fontSize: 13 }}>{p.dob ? `${calcAge(p.dob)} yrs` : '—'}</td>
                        <td style={{ fontSize: 13 }}>{p.gender || '—'}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Link to={`/appointments/new`} state={{ patient: p }}
                              className="btn btn-sm btn-outline-success" style={{ borderRadius: 8, fontSize: 12 }}>
                              <i className="bi bi-plus me-1" />Book
                            </Link>
                            <Link to={`/patients/${p.id}/reports`}
                              className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8, fontSize: 12 }}>
                              <i className="bi bi-file-earmark-text me-1" />Reports
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-3 pb-3">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          )
        )}
      </div>

      {/* Register Modal */}
      <div className="modal fade" id="patientModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"><i className="bi bi-person-plus me-2" />Register New Patient</h5>
              <button className="btn-close" onClick={closeModal} />
            </div>
            <form onSubmit={handleCreate} noValidate>
              <div className="modal-body">
                <ErrorAlert message={error} onClose={() => setError('')} />
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">NIC Number *</label>
                    <input className={`form-control ${formErrors.nic ? 'is-invalid' : ''}`}
                      placeholder="e.g. 199512345678" value={form.nic}
                      onChange={e => setForm(f => ({ ...f, nic: e.target.value }))} />
                    {formErrors.nic && <div className="invalid-feedback">{formErrors.nic}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Full Name *</label>
                    <input className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                      placeholder="Patient full name" value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Mobile Number *</label>
                    <input className={`form-control ${formErrors.mobile ? 'is-invalid' : ''}`}
                      placeholder="0712345678" maxLength={10}
                      value={form.mobile}
                      onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g,'') }))} />
                    {formErrors.mobile && <div className="invalid-feedback">{formErrors.mobile}</div>}
                    <div className="form-text">Used for OTP delivery and patient portal login.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" value={form.dob}
                      onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={form.gender}
                      onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 8 }} disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Registering...</> : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
