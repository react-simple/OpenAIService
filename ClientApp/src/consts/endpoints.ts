// In production (e.g. Azure Web App) leave unset so API calls use same origin.
// For local dev with separate backend, set REACT_APP_API_ORIGIN in .env.development or .env.local.
const API_ORIGIN = process.env.REACT_APP_API_ORIGIN ?? "";

export const ENDPOINTS = {
  chat: {
    post: `${API_ORIGIN}/api/chat`,
  },
  auth: {
    login: `${API_ORIGIN}/api/auth/login`,
    logout: `${API_ORIGIN}/api/auth/logout`,
    me: `${API_ORIGIN}/api/auth/me`,
  },
  memory: {
    get: `${API_ORIGIN}/api/memory`,
    put: `${API_ORIGIN}/api/memory`,
  },
};