import { useCallback, useState } from "react";
import { getChat, getChats, putChat, deleteChat } from "services";
import type { Chat, ChatListItem } from "services/chatsApi";
import type { ChatMessage } from "services/chatApi";

export type { Chat, ChatListItem } from "services/chatsApi";
export type { ChatMessage } from "services/chatApi";

export interface UseChatsReturn {
  currentChatId: number | null;
  setCurrentChatId: (id: number | null) => void;
  getChats: () => Promise<ChatListItem[]>;
  getChat: (chatId: number) => Promise<Chat>;
  putChatContent: (chatId: number, messages: ChatMessage[]) => Promise<void>;
  deleteChat: (chatId: number) => Promise<void>;
}

export function useChats(): UseChatsReturn {
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  const getChatsList = useCallback(() => getChats(), []);
  const getChatById = useCallback((chatId: number) => getChat(chatId), []);
  const putChatContent = useCallback((chatId: number, messages: ChatMessage[]) => putChat(chatId, messages), []);
  const deleteChatById = useCallback((chatId: number) => deleteChat(chatId), []);

  return {
    currentChatId,
    setCurrentChatId,
    getChats: getChatsList,
    getChat: getChatById,
    putChatContent,
    deleteChat: deleteChatById,
  };
}
