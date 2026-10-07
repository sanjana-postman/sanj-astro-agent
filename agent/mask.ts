/** Display-time masking for patient PHI. Prescriber identifiers (name, NPI —
 *  NPI is a public registry number) are shown in full; only patient
 *  identifiers are masked before leaving the server. */

/** "MRN-928471" -> "MRN-••••71" — keep a trailing couple of characters, mask the rest. */
export function maskId(id: string): string {
  const trimmed = id.trim();
  if (trimmed.length <= 2) return '•'.repeat(trimmed.length);
  const visible = trimmed.slice(-2);
  return '•'.repeat(trimmed.length - 2) + visible;
}

/** "1985-04-12" -> "••••-••-12" — keep only the day. */
export function maskDob(dob: string): string {
  const match = dob.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return maskId(dob);
  const [, , , day] = match;
  return `••••-••-${day}`;
}
