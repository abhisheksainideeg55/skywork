/**
 * Skywork API Client
 * Centralized fetch wrapper with auto JWT/admin-key headers.
 * All Context providers use this to communicate with the backend.
 */

import API_BASE from "./apiConfig.js";

const TOKEN_KEY = "skywork_jwt_token";
const ADMIN_KEY = "skywork_enterprise_2026";

function getHeaders() {
  const headers = { "Content-Type": "application/json" };
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      // Fallback admin key for internal sync when no JWT is available
      headers["x-admin-key"] = ADMIN_KEY;
    }
  } catch {
    headers["x-admin-key"] = ADMIN_KEY;
  }
  return headers;
}

async function request(method, path, body = null) {
  const opts = { method, headers: getHeaders() };
  if (body && method !== "GET") {
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API_BASE}${path}`, opts);
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || `API error ${res.status}`);
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  patch: (path, body) => request("PATCH", path, body),
  del: (path) => request("DELETE", path),
};

export default api;
export { API_BASE, getHeaders };
