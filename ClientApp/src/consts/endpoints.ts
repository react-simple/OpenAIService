// In production (e.g. Azure Web App) leave unset so API calls use same origin.
// For local dev with separate backend, set REACT_APP_API_ORIGIN in .env.development or .env.local.
const API_ORIGIN = process.env.REACT_APP_API_ORIGIN ?? "";

export const ENDPOINTS = {
  chat: {
    post: `${API_ORIGIN}/api/chat`,
  },
};