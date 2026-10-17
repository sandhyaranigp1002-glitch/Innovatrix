import { CollegeSecurityConfig } from '../types';

/**
 * College Security & PRN Verification Configuration
 * Configurable format rules and security helpers.
 */
export const DEFAULT_COLLEGE_CONFIG: CollegeSecurityConfig = {
  prnFormatPattern: '^PRN-\\d{4}-\\d{4,6}$',
  prnFormatName: 'PRN-YYYY-XXXX (e.g., PRN-2024-1042)',
  allowedEmailDomain: '*',
  requireAdminApproval: true,
};

/**
 * Masks a PRN to protect sensitive student identity.
 * Example: "PRN-2024-1042" -> "PRN-****-1042"
 */
export function maskPRN(prn: string): string {
  if (!prn) return 'PRN-****-****';
  const trimmed = prn.trim();
  if (trimmed.length <= 6) return '****' + trimmed.slice(-2);

  // If matches standard PRN-YYYY-XXXX
  const parts = trimmed.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-****-${parts[2]}`;
  }

  // General fallback masking: keep first 4 and last 4
  const start = trimmed.slice(0, 4);
  const end = trimmed.slice(-4);
  return `${start}-****-${end}`;
}

/**
 * Validates a PRN against the configured college format.
 */
export function validatePRNFormat(
  prn: string,
  config: CollegeSecurityConfig = DEFAULT_COLLEGE_CONFIG
): { valid: boolean; error?: string } {
  const trimmed = prn.trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, error: 'PRN (Permanent Registration Number) is required.' };
  }

  try {
    const regex = new RegExp(config.prnFormatPattern, 'i');
    if (!regex.test(trimmed)) {
      return {
        valid: false,
        error: `Invalid PRN format. Must follow official format: ${config.prnFormatName}.`,
      };
    }
  } catch {
    // Fallback if custom pattern fails
    if (trimmed.length < 8 || trimmed.length > 20) {
      return { valid: false, error: 'PRN must be between 8 and 20 alphanumeric characters.' };
    }
  }

  return { valid: true };
}

/**
 * Validates student email address.
 * Accepts all valid email addresses (e.g. Gmail, Outlook, Yahoo, campus, or any domain).
 */
export function validateCollegeEmail(
  email: string,
  allowedDomain: string = DEFAULT_COLLEGE_CONFIG.allowedEmailDomain
): { valid: boolean; error?: string } {
  const trimmed = email.trim().toLowerCase();

  // RFC-compliant email structure check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed || !emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }

  // When configured to accept all email IDs:
  if (!allowedDomain || allowedDomain === '*' || allowedDomain === 'all' || allowedDomain === 'any') {
    return { valid: true };
  }

  // If specific institutional domain restriction is configured:
  const isAllowed =
    trimmed.endsWith(allowedDomain.toLowerCase()) ||
    trimmed.endsWith('@brainbridge.edu') ||
    trimmed.endsWith('@campus.edu') ||
    trimmed.endsWith('@gmail.com') ||
    trimmed.endsWith('@outlook.com') ||
    trimmed.endsWith('@yahoo.com') ||
    trimmed.endsWith('@hotmail.com');

  if (!isAllowed) {
    return {
      valid: false,
      error: `Registration requires an authorized email address (ending in ${allowedDomain} or common providers).`,
    };
  }

  return { valid: true };
}

/**
 * Deterministic PRN hash for fast indexing without exposing plaintext PRNs.
 */
export function hashPRN(prn: string): string {
  const clean = prn.trim().toUpperCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `prn_hash_${Math.abs(hash).toString(16)}_${clean.slice(-4)}`;
}
