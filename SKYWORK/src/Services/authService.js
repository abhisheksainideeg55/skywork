/**
 * Skywork Auth Service
 * All authentication is handled by the backend API (MongoDB).
 * Only JWT token and session info are stored in localStorage for session persistence.
 */

import API_BASE_URL from "./apiConfig.js";

const SESSION_KEY = "skywork_session";
const TOKEN_KEY = "skywork_jwt_token";

export const login = async (identifier, password) => {
  const cleanId = String(identifier || '').trim();
  const cleanPass = String(password || '').trim();

  if (!cleanId || !cleanPass) {
    throw new Error("Please enter your email/ID and password.");
  }

  // Authenticate via backend API (MongoDB)
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: cleanId, password: cleanPass })
  });
  const json = await res.json();

  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message || "Invalid email/ID or password.");
  }

  const { token, user: backendUser } = json.data;

  // Store JWT token and session for persistence
  localStorage.setItem(TOKEN_KEY, token);
  const session = {
    userId: backendUser.id,
    token: `${btoa(backendUser.id)}-${Date.now()}`,
    jwtToken: token,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return backendUser;
};

export const logout = (userId, role) => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const updateSessionUserId = (oldUserId, newUserId) => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return;

  try {
    const session = JSON.parse(sessionData);
    if (session.userId === oldUserId) {
      session.userId = newUserId;
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch (e) {
    // Ignore parse error
  }
};

export const getCurrentSession = () => {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;

  try {
    const session = JSON.parse(sessionData);
    if (new Date() > new Date(session.expiresAt)) {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      return null; // Expired
    }
    return session.userId;
  } catch (e) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};
