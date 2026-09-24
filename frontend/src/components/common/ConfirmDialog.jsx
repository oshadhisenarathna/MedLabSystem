import { useEffect } from 'react';

export default function ConfirmDialog({ show, title, message, onConfirm, onCancel, variant = 'danger', loading }) {
  useEffect(() => {
    const el = document.getElementById('confirmModal');
    if (!el) return;
    const { Modal } = window.bootstrap || {};
    if (!Modal) return;
    const modal = Modal.getOrCreateInstance(el);
    show ? modal.show() : modal.hide();
  }, [show]);

  return (
    <div className="modal fade" id="confirmModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title || 'Confirm Action'}</h5>
            <button type="button" className="btn-close" onClick={onCancel} />
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-light" onClick={onCancel} disabled={loading}>Cancel</button>
            <button className={`btn btn-${variant}`} onClick={onConfirm} disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
