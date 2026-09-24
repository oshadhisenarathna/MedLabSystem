import { useState, useEffect } from 'react'
import { testService } from '../../services/testService'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'

const PAGE_SIZE = 10
const EMPTY_FORM = { testCode: '', testName: '', referenceRange: '', price: '' }

export default function LabTestCataloguePage() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setTests(await testService.getAll()) }
    catch (e) { setError('Failed to load tests. The lab test endpoint may not be available yet.') }
    finally { setLoading(false) }
  }

  function openAdd() {
    setForm(EMPTY_FORM); setFormErrors({}); setEditId(null); setError('')
    new window.bootstrap.Modal(document.getElementById('testModal')).show()
  }

  function openEdit(t) {
    setForm({ testCode: t.testCode, testName: t.testName, referenceRange: t.referenceRange || '', price: String(t.price) })
    setFormErrors({}); setEditId(t.id); setError('')
    new window.bootstrap.Modal(document.getElementById('testModal')).show()
  }

  function closeModal() { window.bootstrap.Modal.getInstance(document.getElementById('testModal'))?.hide() }

  function validate() {
    const e = {}
    if (!form.testCode.trim()) e.testCode = 'Test code is required'
    if (!form.testName.trim()) e.testName = 'Test name is required'
    if (!form.referenceRange.trim()) e.referenceRange = 'Reference range is required'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Valid price is required'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave(ev) {
    ev.preventDefault()
    if (!validate()) return
    setSaving(true); setError('')
    const payload = { ...form, testCode: form.testCode.toUpperCase(), price: Number(form.price) }
    try {
      if (editId) {
        const updated = await testService.update(editId, payload)
        setTests(t => t.map(x => x.id === editId ? updated : x))
        setSuccess(`Test "${form.testName}" updated.`)
      } else {
        const created = await testService.create(payload)
        setTests(t => [created, ...t])
        setSuccess(`Test "${form.testName}" added to catalogue.`)
      }
      closeModal()
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to save test.')
    } finally { setSaving(false) }
  }

  const filtered = tests.filter(t =>
    !search || t.testCode?.toLowerCase().includes(search.toLowerCase()) ||
    t.testName?.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="page-header">
        <h1>Lab Test Catalogue</h1>
        <div className="subtitle">Manage the master list of tests, prices, and reference ranges.</div>
      </div>

      {success && (
        <div className="alert alert-success d-flex gap-2 align-items-center mb-3">
          <i className="bi bi-check-circle-fill" />{success}
          <button className="btn-close ms-auto" style={{ fontSize: 11 }} onClick={() => setSuccess('')} />
        </div>
      )}
      <ErrorAlert message={error} onClose={() => setError('')} />

      <div className="table-card">
        <div className="table-card-header">
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search by code or name…" />
          <button className="btn btn-primary btn-sm" style={{ borderRadius: 8 }} onClick={openAdd}>
            <i className="bi bi-plus-lg me-1" />Add Test
          </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          paged.length === 0 ? (
            <EmptyState icon="bi-capsule-pill" title="No tests in catalogue"
              action={<button className="btn btn-primary btn-sm" onClick={openAdd}>Add First Test</button>} />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr><th>Code</th><th>Test Name</th><th>Reference Range</th><th>Price (Rs.)</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {paged.map(t => (
                      <tr key={t.id}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, color: '#0f172a' }}>
                            {t.testCode}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, fontSize: 13 }}>{t.testName}</td>
                        <td style={{ fontSize: 13, color: '#64748b' }}>{t.referenceRange || '—'}</td>
                        <td style={{ fontWeight: 600, color: '#15803d' }}>
                          {Number(t.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8, fontSize: 12 }} onClick={() => openEdit(t)}>
                            <i className="bi bi-pencil me-1" />Edit
                          </button>
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

      {/* Add/Edit Modal */}
      <div className="modal fade" id="testModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className={`bi ${editId ? 'bi-pencil' : 'bi-plus-circle'} me-2`} />
                {editId ? 'Edit Lab Test' : 'Add Lab Test'}
              </h5>
              <button className="btn-close" onClick={closeModal} />
            </div>
            <form onSubmit={handleSave} noValidate>
              <div className="modal-body">
                <ErrorAlert message={error} onClose={() => setError('')} />
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label">Test Code *</label>
                    <input className={`form-control ${formErrors.testCode ? 'is-invalid' : ''}`}
                      placeholder="e.g. FBS" value={form.testCode} disabled={!!editId}
                      style={{ textTransform: 'uppercase' }}
                      onChange={e => setForm(f => ({ ...f, testCode: e.target.value.toUpperCase() }))} />
                    {formErrors.testCode && <div className="invalid-feedback">{formErrors.testCode}</div>}
                  </div>
                  <div className="col-6">
                    <label className="form-label">Price (Rs.) *</label>
                    <input type="number" min="0" step="0.01" className={`form-control ${formErrors.price ? 'is-invalid' : ''}`}
                      placeholder="e.g. 350.00" value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                    {formErrors.price && <div className="invalid-feedback">{formErrors.price}</div>}
                  </div>
                  <div className="col-12">
                    <label className="form-label">Test Name *</label>
                    <input className={`form-control ${formErrors.testName ? 'is-invalid' : ''}`}
                      placeholder="e.g. Fasting Blood Sugar" value={form.testName}
                      onChange={e => setForm(f => ({ ...f, testName: e.target.value }))} />
                    {formErrors.testName && <div className="invalid-feedback">{formErrors.testName}</div>}
                  </div>
                  <div className="col-12">
                    <label className="form-label">Reference Range *</label>
                    <input className={`form-control ${formErrors.referenceRange ? 'is-invalid' : ''}`}
                      placeholder="e.g. 70-100 (numeric range for HIGH/LOW flagging)" value={form.referenceRange}
                      onChange={e => setForm(f => ({ ...f, referenceRange: e.target.value }))} />
                    {formErrors.referenceRange && <div className="invalid-feedback">{formErrors.referenceRange}</div>}
                    <div className="form-text">Use format <code>low-high</code> (e.g. <code>70-100</code>) for automatic HIGH/LOW flagging on reports.</div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: 8 }} disabled={saving}>
                  {saving ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</> : editId ? 'Update Test' : 'Add Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
