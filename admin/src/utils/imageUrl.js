/**
 * Formats image URLs for safe rendering in both Admin Panel and Client.
 * Ensures relative paths have leading slashes so the browser does not resolve them
 * relative to the current route (e.g. /admin/products).
 */
export function getImageUrl(path) {
  if (!path) return '';
  
  const trimmed = String(path).trim();
  if (!trimmed) return '';

  // Absolute URLs (http, https, data URI, blob)
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // If path already starts with '/', return as is
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // Prepend leading slash for assets/... or uploads/...
  return '/' + trimmed;
}

export default getImageUrl;
