export function resolveSiteOrigin(override, fallback = '') {
  const value = override ?? fallback;
  if (!value) return '';
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash) {
    throw new Error('SITE_URL debe ser un origen HTTP(S), sin rutas, credenciales ni parámetros.');
  }
  return url.origin;
}
