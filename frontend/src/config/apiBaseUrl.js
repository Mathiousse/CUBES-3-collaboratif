const LOCAL_API_BASE = 'http://localhost:8080/api';

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function normalizeBaseUrl(url) {
  if (!url) return null;
  return url.replace(/\/+$/, '');
}

export function getApiBaseUrl() {
  const envBase = normalizeBaseUrl(process.env.REACT_APP_API_URL);

  if (typeof window === 'undefined') {
    return envBase || LOCAL_API_BASE;
  }

  const currentHost = window.location.hostname;
  const currentOrigin = window.location.origin;
  const isCurrentLocal = isLocalHostname(currentHost);

  // If the app is opened through a tunnel/domain, do not keep localhost from build-time env.
  if (envBase) {
    if (!isCurrentLocal && envBase.includes('localhost')) {
      return `${currentOrigin}/api`;
    }
    return envBase;
  }

  // Local dev (frontend on 3000, gateway on 8080) keeps explicit localhost gateway.
  if (isCurrentLocal) {
    return LOCAL_API_BASE;
  }

  // Remote/tunnel access defaults to same origin API gateway path.
  return `${currentOrigin}/api`;
}

export const API_BASE_URL = getApiBaseUrl();
