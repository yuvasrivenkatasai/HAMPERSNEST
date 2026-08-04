import { MINIMUM_ORDER_QTY } from './constants';

export const validateQuantityInput = (value) => {
  // Allow empty string temporarily for editing
  if (value === '') return { isValid: true, value: '' };
  
  // Reject non-numeric, decimal, or negative values
  if (!/^\d+$/.test(value)) {
    return { isValid: false, error: 'Numbers only' };
  }
  
  const num = parseInt(value, 10);
  return { isValid: true, value: num };
};

export const sanitizeQuantityOnBlur = (value) => {
  if (value === '' || isNaN(value)) return MINIMUM_ORDER_QTY;
  const num = parseInt(value, 10);
  if (num < MINIMUM_ORDER_QTY) return MINIMUM_ORDER_QTY;
  return num;
};

export const validatePhone = (phone) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 15;
};

export const validateRequiredDate = (dateString, minDaysInFuture = 0, maxYearsInFuture = 3) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  // Check 4 digit year
  const yearStr = date.getFullYear().toString();
  if (yearStr.length !== 4) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const minDate = new Date(today);
  minDate.setDate(minDate.getDate() + minDaysInFuture);
  
  const maxDate = new Date(today);
  maxDate.setFullYear(maxDate.getFullYear() + maxYearsInFuture);
  
  return date >= minDate && date <= maxDate;
};

export const sanitizeGiftTag = (tag, maxLength = 150) => {
  if (!tag) return '';
  return tag.trim().substring(0, maxLength);
};
