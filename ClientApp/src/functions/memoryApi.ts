import { ENDPOINTS } from "consts";

export interface MemoryResponse {
  content: string | null;
}

export async function getMemory(): Promise<MemoryResponse> {
  const res = await fetch(ENDPOINTS.memory.get, {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401 || res.status === 403)
    throw new Error("Unauthorized");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<MemoryResponse>;
}

export async function putMemory(content: string): Promise<void> {
  const res = await fetch(ENDPOINTS.memory.put, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (res.status === 401 || res.status === 403)
    throw new Error("Unauthorized");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}
