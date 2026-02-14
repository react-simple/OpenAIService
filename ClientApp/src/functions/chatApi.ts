import { ENDPOINTS } from "consts";
import type { ChatMessage, ChatRequest, ChatResponse } from "types";

export async function postChat(messages: ChatMessage[], pin: string): Promise<ChatResponse> {
  const res = await fetch(ENDPOINTS.chat.post, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Pin": pin,
    },
    body: JSON.stringify({ messages } as ChatRequest),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<ChatResponse>;
}
