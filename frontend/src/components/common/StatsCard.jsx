export default function StatsCard({ label, value, icon, bg = '#eff6ff', color = '#1d4ed8' }) {
  return (
    <div className="stats-card">
      <div className="stats-icon" style={{ background: bg }}>
        <i className={`bi ${icon}`} style={{ color }} />
      </div>
      <div className="stats-info">
        <div className="label">{label}</div>
        <div className="value">{value ?? '—'}</div>
      </div>
    </div>
  );
}
