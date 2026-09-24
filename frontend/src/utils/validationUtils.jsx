export const MOBILE_REGEX = /^\+?[0-9]{9,13}$/;
export const NIC_REGEX = /^(\d{9}[VXvx]|\d{12})$/;

export function validateMobile(val) {
  if (!val?.trim()) return 'Mobile number is required';
  const flexibleMobileRegex = /^\+?[0-9]{9,13}$/;

  if (!flexibleMobileRegex.test(val.trim())) {
    return 'Invalid mobile number format'; 
  }
  
  return null;
}

export function validateNIC(val) {
  if (!val?.trim()) return 'NIC is required';
  return null;
}

export function validateRequired(val, label = 'This field') {
  if (!val?.toString().trim()) return `${label} is required`;
  return null;
}

export function validatePrice(val) {
  if (!val?.toString().trim()) return 'Price is required';
  if (isNaN(Number(val)) || Number(val) <= 0) return 'Price must be a positive number';
  return null;
}

export function validatePassword(val) {
  if (!val) return 'Password is required';
  if (val.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validateConfirmPassword(pw, confirm) {
  if (!confirm) return 'Please confirm your password';
  if (pw !== confirm) return 'Passwords do not match';
  return null;
}

export function hasErrors(errObj) {
  return Object.values(errObj).some(v => v != null);
}
