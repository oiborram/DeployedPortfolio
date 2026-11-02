// Intended publication target supplied by Oscar. This configuration does not deploy anything.
export function validatePublicationBaseUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('PORTFOLIO_BASE_URL must be an absolute HTTPS base URL.'); }
  if (url.protocol !== 'https:' || !String(value).endsWith('/') || url.search || url.hash || url.username || url.password || !/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(url.pathname)) {
    throw new Error('PORTFOLIO_BASE_URL must be an HTTPS base URL ending in /, with simple path segments and without credentials, query or hash.');
  }
  return url.href;
}

export const site = Object.freeze({
  publicBaseUrl: validatePublicationBaseUrl(process.env.PORTFOLIO_BASE_URL || 'https://iborrero.duckdns.org:9443/portfolio/'),
  applicationRoutes: ['/', '/resume.json']
});
