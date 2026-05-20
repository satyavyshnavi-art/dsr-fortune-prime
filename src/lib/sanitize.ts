/**
 * Input sanitization utilities for text fields.
 */

/**
 * Strips HTML tags (including <script>), trims whitespace.
 */
export function sanitizeInput(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/**
 * Sanitize a filename: remove path separators, null bytes,
 * and non-printable characters. Keeps only alphanumeric, dash,
 * underscore, dot, and space.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[\x00-\x1f]/g, "")
    .replace(/[/\\:*?"<>|]/g, "")
    .replace(/\.{2,}/g, ".")
    .trim()
    .slice(0, 255);
}
