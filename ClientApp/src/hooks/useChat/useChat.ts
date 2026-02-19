import { useEffect, useRef, useState } from "react";
import { getMemory, getChats } from "services";
import type { ChatDisplayMessage } from "types";
import { getStoredMemory } from "functions";
import type { SendOptions, WordCounts } from "./useChat.types";
import { useChatPersistence } from "./useChatPersistence";
import { useChatMessages } from "./useChatMessages";

export type { SendOptions, WordCounts } from "./useChat.types";

export interface UseChatReturn {
  memory: string;
  setMemory: React.Dispatch<React.SetStateAction<string>>;
  chatHistory: ChatDisplayMessage[];
  currentChatId: number | null;
  sendOptions: SendOptions;
  setSendOptions: React.Dispatch<React.SetStateAction<SendOptions>>;
  wordCounts: WordCounts;
  loading: boolean;
  sendMessage: (input: string) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
  loadSelectedChat: (chatId: number) => void;
  startNewChat: () => void;
  deleteMessage: (index: number) => void;
}

export function useChat(): UseChatReturn {
  const [memory, setMemory] = useState(() => getStoredMemory());
  const [sendOptions, setSendOptions] = useState<SendOptions>({ includeResponses: true, includeMemory: true });

  const persistence = useChatPersistence();
  const messages = useChatMessages({
    persistence,
    memory,
    sendOptions,
  });

  const hasLoadedLastChat = useRef(false);

  useEffect(() => {
    getMemory()
      .then((data) => {

        if (data.content !== null)
          setMemory(data.content);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (hasLoadedLastChat.current)
      return;

    hasLoadedLastChat.current = true;
    persistence.getChats()
      .then((list) => {
        if (list.length > 0)
          messages.loadSelectedChat(list[0].chatId);
      })
      .catch(() => {});
    // Intentionally run once on mount to load most recent chat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    memory,
    setMemory,
    chatHistory: messages.chatHistory,
    currentChatId: persistence.currentChatId,
    sendOptions,
    setSendOptions,
    wordCounts: messages.wordCounts,
    loading: messages.loading,
    sendMessage: messages.sendMessage,
    regenerateLastResponse: messages.regenerateLastResponse,
    loadSelectedChat: messages.loadSelectedChat,
    startNewChat: messages.startNewChat,
    deleteMessage: messages.deleteMessage,
  };
}
