/**
 * Phone number utilities for Nigerian phone numbers
 */

export const NIGERIA_COUNTRY_CODE = '+234';

/**
 * Format phone number with +234 prefix
 * @param input - Raw phone number input
 * @returns Formatted phone number with +234 prefix
 */
export const formatNigerianPhone = (input: string): string => {
  // Remove all non-digit characters
  const digits = input.replace(/\D/g, '');
  
  // If empty, return +234
  if (!digits) {
    return NIGERIA_COUNTRY_CODE;
  }
  
  // If starts with 234, add + prefix
  if (digits.startsWith('234')) {
    return `+${digits}`;
  }
  
  // If starts with 0, remove it and add +234
  if (digits.startsWith('0')) {
    const withoutZero = digits.substring(1);
    return `${NIGERIA_COUNTRY_CODE}${withoutZero}`;
  }
  
  // If it's just the local number (without country code), add +234
  if (digits.length <= 10) {
    return `${NIGERIA_COUNTRY_CODE}${digits}`;
  }
  
  // For other cases, just add + if it doesn't have it
  return digits.startsWith('234') ? `+${digits}` : `${NIGERIA_COUNTRY_CODE}${digits}`;
};

/**
 * Validate Nigerian phone number
 * @param phone - Phone number to validate
 * @returns true if valid Nigerian phone number
 */
export const validateNigerianPhone = (phone: string): boolean => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Must start with +234
  if (!cleaned.startsWith('+234')) {
    return false;
  }
  
  // Remove +234 and check remaining digits
  const localNumber = cleaned.substring(4);
  
  // Local number should be exactly 10 digits
  if (localNumber.length !== 10) {
    return false;
  }
  
  // Local number should not start with 0
  if (localNumber.startsWith('0')) {
    return false;
  }
  
  // Should start with valid Nigerian mobile prefixes (7, 8, 9)
  const firstDigit = localNumber.charAt(0);
  return ['7', '8', '9'].includes(firstDigit);
};

/**
 * Get display phone number (removes +234 for display)
 * @param phone - Full phone number with +234
 * @returns Display format (0XXXXXXXXX)
 */
export const getDisplayPhone = (phone: string): string => {
  if (!phone || !phone.startsWith('+234')) {
    return phone;
  }
  
  const localNumber = phone.substring(4);
  return `0${localNumber}`;
};

/**
 * Get error message for invalid phone number
 * @param phone - Phone number to check
 * @returns Error message or null if valid
 */
export const getPhoneValidationError = (phone: string): string | null => {
  if (!phone || phone === NIGERIA_COUNTRY_CODE) {
    return 'Phone number is required';
  }
  
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+234')) {
    return 'Phone number must start with +234';
  }
  
  const localNumber = cleaned.substring(4);
  
  if (localNumber.length === 0) {
    return 'Please enter your phone number';
  }
  
  if (localNumber.length < 10) {
    return 'Phone number must be 10 digits after +234';
  }
  
  if (localNumber.length > 10) {
    return 'Phone number must be exactly 10 digits after +234';
  }
  
  if (localNumber.startsWith('0')) {
    return 'Phone number cannot start with 0 after +234';
  }
  
  const firstDigit = localNumber.charAt(0);
  if (!['7', '8', '9'].includes(firstDigit)) {
    return 'Nigerian mobile numbers must start with 7, 8, or 9';
  }
  
  return null;
};