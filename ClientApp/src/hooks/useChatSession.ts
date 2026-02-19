import { useCallback, useEffect, useRef, useState } from "react";
import { getChat, getChats } from "services";
import type { ChatDisplayMessage } from "types";
import { DisplayMessageType } from "types";
import type { WordCounts } from "./useChat/useChat.types";

const initialWordCounts: WordCounts = {
  lastSent: 0,
  lastReceived: 0,
  totalSent: 0,
  totalReceived: 0,
};

export interface UseChatSessionReturn {
  chatHistory: ChatDisplayMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatDisplayMessage[]>>;
  currentChatId: number | null;
  setCurrentChatId: React.Dispatch<React.SetStateAction<number | null>>;
  wordCounts: WordCounts;
  setWordCounts: React.Dispatch<React.SetStateAction<WordCounts>>;
  loadSelectedChat: (chatId: number) => void;
  startNewChat: () => void;
}

export function useChatSession(): UseChatSessionReturn {
  const [chatHistory, setChatHistory] = useState<ChatDisplayMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [wordCounts, setWordCounts] = useState<WordCounts>(initialWordCounts);
  const hasLoadedLastChat = useRef(false);

  const loadSelectedChat = useCallback((chatId: number) => {
    getChat(chatId).then((chat) => {
      const content = chat.content ?? [];
      const displayHistory: ChatDisplayMessage[] = content.map((m) => ({
        ...m,
        displayType: DisplayMessageType.Normal,
      }));
      setChatHistory(displayHistory);
      setCurrentChatId(chat.chatId);
      setWordCounts({ lastSent: 0, lastReceived: 0, totalSent: 0, totalReceived: 0 });
    });
  }, []);

  const startNewChat = useCallback(() => {
    setChatHistory([]);
    setCurrentChatId(null);
    setWordCounts({ lastSent: 0, lastReceived: 0, totalSent: 0, totalReceived: 0 });
  }, []);

  useEffect(() => {
    if (hasLoadedLastChat.current)
      return;

    hasLoadedLastChat.current = true;
    getChats()
      .then((list) => {
        if (list.length > 0)
          loadSelectedChat(list[0].chatId);
      })
      .catch(() => {});
  }, [loadSelectedChat]);

  return {
    chatHistory,
    setChatHistory,
    currentChatId,
    setCurrentChatId,
    wordCounts,
    setWordCounts,
    loadSelectedChat,
    startNewChat,
  };
}
