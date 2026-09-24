export default function LoadingSpinner({ fullPage = false, text = 'Loading...' }) {
  if (fullPage) return (
    <div className="full-page-loader">
      <div className="spinner-border" role="status" style={{width:36,height:36}} />
      <span>{text}</span>
    </div>
  );
  return (
    <div className="text-center py-5">
      <div className="spinner-border" role="status" />
      <div className="mt-2 text-muted small">{text}</div>
    </div>
  );
}
