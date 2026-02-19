import { useCallback, useState } from "react";
import { getChat, getChats, putChat } from "services";
import type { ChatMessage } from "types";

export interface UseChatPersistenceReturn {
  currentChatId: number | null;
  setCurrentChatId: (id: number | null) => void;
  getChats: () => Promise<{ chatId: number; title: string; chatUpdate: string | Date }[]>;
  getChat: (chatId: number) => Promise<{ chatId: number; title: string; chatUpdate: string | Date; content: ChatMessage[] | null }>;
  putChatContent: (chatId: number, messages: ChatMessage[]) => Promise<void>;
}

export function useChatPersistence(): UseChatPersistenceReturn {
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);

  const getChatsList = useCallback(() => getChats(), []);
  const getChatById = useCallback((chatId: number) => getChat(chatId), []);
  const putChatContent = useCallback((chatId: number, messages: ChatMessage[]) => putChat(chatId, messages), []);

  return {
    currentChatId,
    setCurrentChatId,
    getChats: getChatsList,
    getChat: getChatById,
    putChatContent,
  };
}
