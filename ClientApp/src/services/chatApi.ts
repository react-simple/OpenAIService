import { ENDPOINTS } from "consts";

export type ChatRole = "user" | "system" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  chatId?: number | null;
  /** When true (default), assistant messages are sent to OpenAI; when false, only user and system messages are sent. */
  includeResponses?: boolean;
  /** When true (default), system (memory) message is sent to OpenAI; when false, it is omitted. */
  includeMemory?: boolean;
}

export interface ChatResponse {
  chatId: number;
  messages: ChatMessage[];
}

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
