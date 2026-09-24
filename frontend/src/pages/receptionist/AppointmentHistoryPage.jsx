import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { appointmentService } from '../../services/appointmentService'
import StatusBadge from '../../components/common/StatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorAlert from '../../components/common/ErrorAlert'
import EmptyState from '../../components/common/EmptyState'
import SearchBar from '../../components/common/SearchBar'
import Pagination from '../../components/common/Pagination'
import { formatDateTime, todayISO } from '../../utils/dateUtils'

const PAGE_SIZE = 12

export default function AppointmentHistoryPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [date, setDate] = useState(todayISO())
  const [search, setSearch] = useState('')
  const [filterPayment, setFilterPayment] = useState('ALL')
  const [page, setPage] = useState(1)

  useEffect(() => { load(date) }, [date])

  async function load(d) {
    setLoading(true); setError('')
    try { setAppointments(await appointmentService.getByDate(d)) }
    catch (e) { setError('Failed to load appointments.') }
    finally { setLoading(false) }
  }

  const filtered = appointments.filter(a => {
    const matchSearch = !search ||
      a.invoiceNo?.toLowerCase().includes(search.toLowerCase()) ||
      a.patient?.name?.toLowerCase().includes(search.toLowerCase())
    
    
    const matchPay = filterPayment === 'ALL' || 
                     (filterPayment === 'PAID' && a.paymentStatus === 'PAID') ||
                     (filterPayment === 'PENDING' && a.paymentStatus !== 'PAID')

    return matchSearch && matchPay
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalRevenue = appointments.filter(a => a.paymentStatus === 'PAID')
    .reduce((s, a) => s + Number(a.totalAmount || 0), 0)

  return (
    <div>
      <div className="page-header">
        <h1>Appointments</h1>
        <div className="subtitle">View and manage appointments by date.</div>
      </div>

      <ErrorAlert message={error} onClose={() => setError('')} />

      {/* Summary row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Total Appointments</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{appointments.length}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Paid</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#15803d' }}>{appointments.filter(a => a.paymentStatus === 'PAID').length}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Unpaid</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#c2410c' }}>{appointments.filter(a => a.paymentStatus !== 'PAID').length}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>Revenue Collected</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Rs. {totalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
          <div className="d-flex align-items-center gap-2">
            <input type="date" className="form-control form-control-sm" style={{ width: 150 }}
              value={date} onChange={e => { setDate(e.target.value); setPage(1) }} />
            <select className="form-select form-select-sm" style={{ width: 120 }}
              value={filterPayment} onChange={e => { setFilterPayment(e.target.value); setPage(1) }}>
              <option value="ALL">All</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Unpaid</option>
            </select>
          </div>
          <SearchBar value={search} onChange={v => { setSearch(v); setPage(1) }} placeholder="Search invoice or patient…" />
          <Link to="/appointments/new" className="btn btn-primary btn-sm" style={{ borderRadius: 8 }}>
            <i className="bi bi-plus-lg me-1" />New
          </Link>
        </div>

        {loading ? <LoadingSpinner /> : (
          paged.length === 0 ? (
            <EmptyState icon="bi-calendar2-x" title="No appointments"
              subtitle={`No appointments found for ${date}.`}
              action={<Link to="/appointments/new" className="btn btn-primary btn-sm">Book Appointment</Link>} />
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr><th>Invoice</th><th>Patient</th><th>Date & Time</th><th>Amount (Rs.)</th><th>Payment</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {paged.map(a => {
                      
                      const appointmentId = a.id || a.appointmentId || a.invoiceNo;
                      
                      return (
                        <tr key={appointmentId}>
                          <td>
                            <Link to={`/appointments/${appointmentId}`} style={{ fontWeight: 700, fontSize: 13, color: '#1d6fa4', textDecoration: 'none' }}>
                              {a.invoiceNo}
                            </Link>
                          </td>
                          <td style={{ fontWeight: 500, fontSize: 13 }}>{a.patient?.name || '—'}</td>
                          <td style={{ fontSize: 12.5, color: '#64748b' }}>{formatDateTime(a.appointmentDate)}</td>
                          <td style={{ fontWeight: 600 }}>{Number(a.totalAmount || 0).toLocaleString()}</td>
                          <td><StatusBadge paymentStatus={a.paymentStatus} /></td>
                          <td>
                            <Link to={`/appointments/${appointmentId}`} className="btn btn-sm btn-outline-primary" style={{ borderRadius: 8, fontSize: 12 }}>
                              View
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
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