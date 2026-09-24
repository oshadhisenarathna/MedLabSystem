export default function EmptyState({ icon = 'bi-inbox', title = 'No records found', subtitle, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><i className={`bi ${icon}`} /></div>
      <div className="empty-state-title">{title}</div>
      {subtitle && <div className="empty-state-sub">{subtitle}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
