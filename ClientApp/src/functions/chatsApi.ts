import { ENDPOINTS } from "consts";
import type { ChatDto, ChatListItem } from "types";
import type { ChatMessage } from "types";

export async function getChats(): Promise<ChatListItem[]> {
  const res = await fetch(ENDPOINTS.chats.list, {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401 || res.status === 403)
    throw new Error("Unauthorized");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<ChatListItem[]>;
}

export async function getChat(chatId: number): Promise<ChatDto> {
  const res = await fetch(ENDPOINTS.chats.get(chatId), {
    method: "GET",
    credentials: "include",
  });

  if (res.status === 401 || res.status === 403)
    throw new Error("Unauthorized");

  if (res.status === 404)
    throw new Error("Chat not found");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<ChatDto>;
}

export async function deleteChat(chatId: number): Promise<void> {
  const res = await fetch(ENDPOINTS.chats.delete(chatId), {
    method: "DELETE",
    credentials: "include",
  });

  if (res.status === 401 || res.status === 403)
    throw new Error("Unauthorized");

  if (res.status === 404)
    throw new Error("Chat not found");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export async function putChat(chatId: number, messages: ChatMessage[]): Promise<void> {
  const res = await fetch(ENDPOINTS.chats.put(chatId), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (res.status === 401 || res.status === 403)
    throw new Error("Unauthorized");

  if (res.status === 404)
    throw new Error("Chat not found");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
}
