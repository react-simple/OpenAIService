import { ENDPOINTS } from "consts";

export interface AuthUser {
  email?: string;
}

export async function getMe(): Promise<AuthUser> {
  const res = await fetch(ENDPOINTS.auth.me, {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401)
    throw new Error("Unauthorized");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<AuthUser>;
}

export async function logout(): Promise<void> {
  const res = await fetch(ENDPOINTS.auth.logout, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}
