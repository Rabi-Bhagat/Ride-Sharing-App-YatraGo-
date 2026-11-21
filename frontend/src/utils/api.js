// Central API/Socket base configuration.
//
// Local dev: leave VITE_API_BASE_URL empty so requests use relative /api paths
// and Vite's proxy forwards them to http://127.0.0.1:5000.
//
// Split hosting (e.g. frontend on Cloudflare Pages + backend on Railway):
//   VITE_API_BASE_URL=https://your-app.up.railway.app
//   VITE_SOCKET_URL=https://your-app.up.railway.app   (optional; defaults to API base)
//
// The value is read at build time by Vite, so set it in the Cloudflare Pages
// build environment before running the build.

const trimTrailingSlashes = (value) => String(value || '').replace(/\/+$/, '');

export const API_BASE_URL = trimTrailingSlashes(import.meta.env.VITE_API_BASE_URL);
export const SOCKET_URL = trimTrailingSlashes(
  import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL
);

export const isCrossOriginApi = Boolean(API_BASE_URL);

export const apiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
};

export const apiFetch = (path, options) => fetch(apiUrl(path), options);
