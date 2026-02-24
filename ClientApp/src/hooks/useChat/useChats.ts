import { useCallback, useState } from "react";
import { getChat, getChats, putChat, deleteChat } from "services";
import type { Guid } from "utils";
import type { Chat, ChatListItem } from "services/chatsApi";
import type { ChatMessage } from "services/chatApi";

export type { Chat, ChatListItem } from "services/chatsApi";
export type { ChatMessage } from "services/chatApi";

export interface UseChatsReturn {
  currentChatId: Guid | null;
  setCurrentChatId: (id: Guid | null) => void;
  getChats: () => Promise<ChatListItem[]>;
  getChat: (chatId: Guid) => Promise<Chat>;
  putChatContent: (chatId: Guid, messages: ChatMessage[]) => Promise<void>;
  deleteChat: (chatId: Guid) => Promise<void>;
}

export function useChats(): UseChatsReturn {
  const [currentChatId, setCurrentChatId] = useState<Guid | null>(null);

  const getChatsList = useCallback(() => getChats(), []);
  const getChatById = useCallback((chatId: Guid) => getChat(chatId), []);
  const putChatContent = useCallback((chatId: Guid, messages: ChatMessage[]) => putChat(chatId, messages), []);
  const deleteChatById = useCallback((chatId: Guid) => deleteChat(chatId), []);

  return {
    currentChatId,
    setCurrentChatId,
    getChats: getChatsList,
    getChat: getChatById,
    putChatContent,
    deleteChat: deleteChatById,
  };
}
