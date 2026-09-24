const MAP = {
  PENDING:  { cls: 'badge-pending',  icon: 'bi-hourglass-split', label: 'Pending' },
  ENTERED:  { cls: 'badge-entered',  icon: 'bi-pencil-fill',     label: 'Entered' },
  VERIFIED: { cls: 'badge-verified', icon: 'bi-check-circle-fill',label: 'Verified' },
  RELEASED: { cls: 'badge-released', icon: 'bi-file-earmark-check-fill', label: 'Released' },
  PAID:     { cls: 'badge-paid',     icon: 'bi-check-circle-fill', label: 'Paid' },
  PENDING_PAY:{ cls:'badge-unpaid',  icon: 'bi-clock-fill',       label: 'Unpaid' },
};

export default function StatusBadge({ status, paymentStatus }) {
  const key = paymentStatus
    ? (paymentStatus === 'PAID' ? 'PAID' : 'PENDING_PAY')
    : status;
  const { cls, icon, label } = MAP[key] || { cls: 'badge-na', icon: 'bi-question-circle', label: key };
  return (
    <span className={`status-pill ${cls}`}>
      <i className={`bi ${icon}`} style={{fontSize:10}} />
      {label}
    </span>
  );
}
