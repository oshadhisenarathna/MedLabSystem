const MAP = {
  HIGH:   { cls:'badge-high',   icon:'bi-arrow-up-circle-fill',   label:'HIGH' },
  LOW:    { cls:'badge-low',    icon:'bi-arrow-down-circle-fill', label:'LOW' },
  NORMAL: { cls:'badge-normal', icon:'bi-check-circle-fill',      label:'NORMAL' },
  'N/A':  { cls:'badge-na',     icon:'bi-dash-circle',            label:'N/A' },
};

export default function ResultFlagBadge({ flag }) {
  const { cls, icon, label } = MAP[flag] || MAP['N/A'];
  return (
    <span className={`status-pill ${cls}`}>
      <i className={`bi ${icon}`} style={{fontSize:10}} />
      {label}
    </span>
  );
}
