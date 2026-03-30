const AUTH_KEY = "mahara_auth";

export type UserRole =
  | "Founder"
  | "Admin"
  | "CentreHead"
  | "Teacher"
  | "Agent"
  | "Parent";

export function getAuthUser(): {
  username: string;
  role: UserRole;
  name: string;
} | null {
  const raw = localStorage.getItem(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setAuthUser(user: {
  username: string;
  role: UserRole;
  name: string;
}): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}
