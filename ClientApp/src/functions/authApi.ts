import { ENDPOINTS } from "consts";

export async function validatePin(pin: string): Promise<void> {
  const res = await fetch(ENDPOINTS.auth.validatePin, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin }),
  });

  if (res.status === 401)
    throw new Error("Unauthorized");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}
