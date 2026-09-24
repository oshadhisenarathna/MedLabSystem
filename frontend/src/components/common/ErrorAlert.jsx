export default function ErrorAlert({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="alert alert-danger alert-dismissible d-flex align-items-start gap-2 mb-3" role="alert">
      <i className="bi bi-exclamation-triangle-fill mt-1 flex-shrink-0" />
      <div className="flex-1">{message}</div>
      {onClose && (
        <button type="button" className="btn-close" style={{fontSize:11}} onClick={onClose} aria-label="Close" />
      )}
    </div>
  );
}
