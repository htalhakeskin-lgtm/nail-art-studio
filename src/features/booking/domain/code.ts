/**
 * BR-RND-010: appointment code "NAS-7K2Q". Letters and digits that are easy to read aloud and
 * never confused (no 0/O, 1/I/L, 2/Z, 5/S, 8/B). 4 characters from 23 → ~280 000 codes; the
 * unique index settles the rare clash and the action retries.
 */
export const CODE_ALPHABET = "ACDEFGHJKMNPQRTUVWXY349";

const PATTERN = new RegExp(`^NAS-[${CODE_ALPHABET}]{4}$`);

/** `random` returns integers in [0, 256): crypto.getRandomValues in the app, fixed in tests. */
export function generateAppointmentCode(randomBytes: (count: number) => Uint8Array): string {
  const bytes = randomBytes(4);
  const characters = Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]);
  return `NAS-${characters.join("")}`;
}

export function isAppointmentCode(value: string): boolean {
  return PATTERN.test(value);
}
