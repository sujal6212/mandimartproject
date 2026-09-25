/**
 * Utility to resolve asset URLs correctly across all environments:
 * - Local dev (/)
 * - AI Studio dev/preview
 * - GitHub Pages subdirectory (/mandi/)
 */
export function getAssetUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Strip any leading slash
  const clean = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL || './';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${clean}`;
}
