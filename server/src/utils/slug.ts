export const SLUG_MIN = 3;
export const SLUG_MAX = 30;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const OBJECT_ID_PATTERN = /^[0-9a-f]{24}$/i;

const RESERVED_SLUGS = new Set(['me', 'staff']);

export function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidSlug(value: string): boolean {
  return (
    value.length >= SLUG_MIN &&
    value.length <= SLUG_MAX &&
    SLUG_PATTERN.test(value) &&
    !OBJECT_ID_PATTERN.test(value) &&
    !RESERVED_SLUGS.has(value)
  );
}
