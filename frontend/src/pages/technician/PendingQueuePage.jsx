import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { reportService } from '../../services/reportService'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'

const PAGE_SIZE = 12

export default function PendingQueuePage({ adminRelease }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [page, setPage] = useState(1)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setReports(await reportService.getPending()) }
    catch (e) { setError('Failed to load the pending queue.') }
    finally { setLoading(false) }
  }

  const allStatuses = adminRelease
    ? ['ALL', 'PENDING', 'ENTERED', 'VERIFIED']
    : ['ALL', 'PENDING', 'ENTERED']

  const filtered = reports.filter(r => {
    const matchSearch = !search ||
      r.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      r.testName?.toLowerCase().includes(search.toLowerCase()) ||
      r.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
      r.testCode?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const counts = {
    PENDING:  reports.filter(r => r.status === 'PENDING').length,
    ENTERED:  reports.filter(r => r.status === 'ENTERED').length,
    VERIFIED: reports.filter(r => r.status === 'VERIFIED').length,
  }

  function getActionButton(r) {
    if (adminRelease) {
      if (r.status === 'VERIFIED') return (
        <Link to={`/queue/${r.reportId}/release`} className="btn btn-sm btn-success" style={{ borderRadius: 8, fontSize: 12 }}>
          <i className="bi bi-file-earmark-check me-1" />Release
        </Link>
      )
      return <span style={{ fontSize: 12, color: '#94a3b8' }}>Awaiting verification</span>
    }
    if (r.status === 'PENDING') return (
      <Link to={`/queue/${r.reportId}/enter`} className="btn btn-sm btn-primary" style={{ borderRadius: 8, fontSize: 12 }}>
        <i className="bi bi-pencil me-1" />Enter Result
      </Link>
    )
    if (r.status === 'ENTERED') return (
      <Link to={`/queue/${r.reportId}/verify`} className="btn btn-sm btn-outline-success" style={{ borderRadius: 8, fontSize: 12 }}>
        <i className="bi bi-check-circle me-1" />Verify
      </Link>
    )
    if (r.status === 'VERIFIED') return (
      <Link to={`/queue/${r.reportId}/release`} className="btn btn-sm btn-success" style={{ borderRadius: 8, fontSize: 12 }}>
        <i className="bi bi-file-earmark-check me-1" />Release
      </Link>
    )
    return null
  }

  return (
    <div>
      <div className="page-header">
        <h1>{adminRelease ? 'Release Reports' : 'Pending Test Queue'}</h1>
        <div className="subtitle">
          {adminRelease
            ? 'Review verified reports and release them to patients.'
            : 'Enter and verify test results for all pending samples.'}
        </div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Status pills summary */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} style={{ background: '#fff', borderRadius: 10, padding: '10px 18px', boxShadow: '0 1px 3px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusBadge status={status} />
            <span style={{ fontWeight: 700, fontSize: 18, color: '#0f172a' }}>{count}</span>
          </div>
        ))}
        <button
          onClick={load}
          className="btn btn-sm btn-light ms-auto"
          style={{ borderRadius: 8, alignSelf: 'center' }}
        >
          <i className="bi bi-arrow-clockwise me-1" />Refresh
        </button>
      </div>

      <div className="table-card">
        <div className="table-card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="d-flex gap-2 flex-wrap">
            {allStatuses.map(s => (
              <button
                key={s}
                className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-light'}`}
                style={{ borderRadius: 20, fontSize: 12 }}
                onClick={() => { setFilterStatus(s); setPage(1) }}
              >
                {s === 'ALL' ? `All (${reports.length})` : `${s} (${counts[s] || 0})`}
              </button>
            ))}
          </div>
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1) }}
            placeholder="Search patient, test, invoice…"
          />
        </div>

        {loading ? <LoadingSpinner /> : (
          paged.length === 0 ? (
            <EmptyState
              icon="bi-check-circle"
              title={reports.length === 0 ? 'Queue is empty' : 'No matching records'}
              subtitle={reports.length === 0 ? 'No pending tests right now.' : 'Try a different filter or search.'}
            />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Test</th>
                      <th>Ref. Range</th>
                      <th>Invoice</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(r => (
                      <tr key={r.reportId}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.patientName}</div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                            {r.patientNic} &middot; Age {r.patientAge} &middot; {r.patientGender}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{r.testName}</div>
                          <span style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#64748b' }}>{r.testCode}</span>
                        </td>
                        <td style={{ fontSize: 12.5, color: '#64748b' }}>{r.referenceRange || '—'}</td>
                        <td style={{ fontSize: 12.5, color: '#64748b' }}>{r.invoiceNo}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td>{getActionButton(r)}</td>
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
    </div>
  )
}
