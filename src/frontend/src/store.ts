// This file is kept for reference only.
// All data is now persisted in the ICP backend canister.
// Auth session is kept in localStorage for UX continuity.

const AUTH_KEY = "mahara_auth";

export function getAuthUser(): {
  username: string;
  role: "Admin" | "Agent";
  name: string;
} | null {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setAuthUser(user: {
  username: string;
  role: "Admin" | "Agent";
  name: string;
}): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}
