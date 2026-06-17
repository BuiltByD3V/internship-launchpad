export function parseAllowedOrigins(value: string | undefined): string[] {
  if (!value) return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item !== '*')
    .map((item) => {
      try {
        return new URL(item).origin;
      } catch {
        return null;
      }
    })
    .filter((item): item is string => item !== null);
}

export function isAllowedOrigin(
  origin: string | undefined,
  allowedOrigins: readonly string[],
): boolean {
  if (!origin) return true;

  try {
    return allowedOrigins.includes(new URL(origin).origin);
  } catch {
    return false;
  }
}
