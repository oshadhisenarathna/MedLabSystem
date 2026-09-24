import { useState, useEffect, useRef } from 'react'
import { userService } from '../../services/userService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import { getInitials } from '../../utils/tokenUtils'

const ROLES = ['RECEPTIONIST', 'TECHNICIAN']
const ROLE_COLORS = { ADMIN: 'role-admin', RECEPTIONIST: 'role-receptionist', TECHNICIAN: 'role-technician' }
const PAGE_SIZE = 10

const EMPTY_FORM = { name: '', username: '', email: '', role: 'RECEPTIONIST' }

export default function UserManagementPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const modalRef = useRef(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setUsers(await userService.getAll()) }
    catch (e) { setError('Failed to load users. The user management endpoint may not be available yet.') }
    finally { setLoading(false) }
  }

  function openModal() {
    setForm(EMPTY_FORM)
    setFormErrors({})
    setError('')
    const m = new window.bootstrap.Modal(document.getElementById('userModal'))
    m.show()
  }

  function closeModal() {
    window.bootstrap.Modal.getInstance(document.getElementById('userModal'))?.hide()
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.username.trim()) e.username = 'Username is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email format'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleCreate(ev) {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true)
    setError('')
    try {
      const newUser = await userService.create(form)
      setUsers(u => [newUser, ...u])
      setSuccess(`User "${form.username}" created with default password Lab@1234`)
      closeModal()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to create user.')
    } finally { setSaving(false) }
  }

  async function toggleActive(user) {
    setActionLoading(user.id)
    try {
      if (user.isActive) await userService.deactivate(user.id)
      else await userService.activate(user.id)
      setUsers(u => u.map(x => x.id === user.id ? { ...x, isActive: !x.isActive } : x))
    } catch (e) {
      setError(e?.response?.data?.message || 'Action failed.')
    } finally { setActionLoading(null) }
  }

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <h1>Staff User Management</h1>
        <div className="subtitle">Create and manage Admin, Receptionist, and Technician accounts.</div>
      </div>

      {success && (
        <div className="alert alert-success d-flex gap-2 align-items-start">
          <i className="bi bi-check-circle-fill flex-shrink-0 mt-1" />
          <div>{success}</div>
          <button className="btn-close ms-auto" style={{ fontSize: 11 }} onClick={() => setSuccess('')} />
        </div>
      )}
      <ErrorAlert message={error} onClose={() => setError('')} />

      <div className="table-card">
        <div className="table-card-header">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search by name or username…" />
          <button className="btn btn-primary btn-sm" style={{ borderRadius: 8 }} onClick={openModal}>
            <i className="bi bi-person-plus me-1" />Add User
          </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          paged.length === 0 ? (
            <EmptyState icon="bi-people" title="No users found"
              subtitle={search ? 'Try a different search term.' : 'Add the first staff user.'}
              action={<button className="btn btn-primary btn-sm" onClick={openModal}>Add User</button>} />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr><th>User</th><th>Username</th><th>Role</th><th>Email</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {paged.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#1d6fa4,#0ea5e9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                              {getInitials(u.name)}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 13 }}>{u.username}</td>
                        <td><span className={`status-pill ${ROLE_COLORS[u.role] || ''}`}>{u.role}</span></td>
                        <td style={{ fontSize: 13, color: '#64748b' }}>{u.email || '—'}</td>
                        <td>
                          <span className={`status-pill ${u.isActive ? 'badge-verified' : 'badge-unpaid'}`}>
                            <i className={`bi ${u.isActive ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} style={{ fontSize: 10 }} />
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          {u.role !== 'ADMIN' && (
                            <button
                              className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                              style={{ borderRadius: 8, fontSize: 12 }}
                              onClick={() => toggleActive(u)}
                              disabled={actionLoading === u.id}
                            >
                              {actionLoading === u.id
                                ? <span className="spinner-border spinner-border-sm" />
                                : u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}
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

      {/* Add User Modal */}
      <div className="modal fade" id="userModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"><i className="bi bi-person-plus me-2" />Add Staff User</h5>
              <button className="btn-close" onClick={closeModal} />
            </div>
            <form onSubmit={handleCreate} noValidate>
              <div className="modal-body">
                <div className="alert alert-info d-flex gap-2 align-items-start mb-4" style={{ fontSize: 12.5 }}>
                  <i className="bi bi-info-circle-fill mt-1 flex-shrink-0" />
                  <div>Default password will be set to <strong>Lab@1234</strong>. The user will be required to change it on first login.</div>
                </div>
                <ErrorAlert message={error} onClose={() => setError('')} />
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Full Name *</label>
                    <input className={`form-control ${formErrors.name ? 'is-invalid' : ''}`} placeholder="e.g. Dr. Kamal Perera"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                    {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                  </div>
                  <div className="col-6">
                    <label className="form-label">Username *</label>
                    <input className={`form-control ${formErrors.username ? 'is-invalid' : ''}`} placeholder="e.g. dr.kamal"
                      value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase() }))} />
                    {formErrors.username && <div className="invalid-feedback">{formErrors.username}</div>}
                  </div>
                  <div className="col-6">
                    <label className="form-label">Role *</label>
                    <select className="form-select" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Email *</label>
                    <input type="email" className={`form-control ${formErrors.email ? 'is-invalid' : ''}`} placeholder="email@lab.lk"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                    {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 8 }} disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Creating...</> : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
