import { ENDPOINTS } from "consts";
import type { ChatMessage, ChatRequest, ChatResponse } from "types";

export async function postChat(
  messages: ChatMessage[],
  chatId?: number | null,
  includeResponses = true,
  includeMemory = true,
): Promise<ChatResponse> {
  const body: ChatRequest = { messages, includeResponses, includeMemory };

  if (chatId != null)
    body.chatId = chatId;

  const res = await fetch(ENDPOINTS.chat.post, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<ChatResponse>;
}
