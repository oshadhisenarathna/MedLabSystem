export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function calcAge(dob) {
  if (!dob) return 'N/A';
  const b = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

export function countdownLabel(expiresAt) {
  const diff = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
  const m = Math.floor(diff / 60).toString().padStart(2,'0');
  const s = (diff % 60).toString().padStart(2,'0');
  return `${m}:${s}`;
}
