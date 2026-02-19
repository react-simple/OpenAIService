import { useCallback, useState } from "react";
import { postChat } from "services";
import type { ChatMessage, ChatDisplayMessage } from "types";
import { DisplayMessageType } from "types";
import { countWords } from "utils";
import type { SendOptions, WordCounts } from "./useChat.types";
import type { UseChatPersistenceReturn } from "./useChatPersistence";

const initialWordCounts: WordCounts = {
  lastSent: 0,
  lastReceived: 0,
  totalSent: 0,
  totalReceived: 0,
};

export interface UseChatMessagesParams {
  persistence: UseChatPersistenceReturn;
  memory: string;
  sendOptions: SendOptions;
}

export interface UseChatMessagesReturn {
  chatHistory: ChatDisplayMessage[];
  wordCounts: WordCounts;
  loading: boolean;
  sendMessage: (input: string) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
  loadSelectedChat: (chatId: number) => void;
  startNewChat: () => void;
  deleteMessage: (index: number) => void;
}

export function useChatMessages({ persistence, memory, sendOptions }: UseChatMessagesParams): UseChatMessagesReturn {
  const [chatHistory, setChatHistory] = useState<ChatDisplayMessage[]>([]);
  const [wordCounts, setWordCounts] = useState<WordCounts>(initialWordCounts);
  const [loading, setLoading] = useState(false);

  const { currentChatId, setCurrentChatId, getChat, putChatContent } = persistence;

  const buildRequestMessages = useCallback((): ChatMessage[] => {
    const msgs: ChatMessage[] = [];

    if (memory.trim())
      msgs.push({ role: "system", content: memory.trim() });

    const normalEntries = chatHistory.filter((m) => m.displayType === DisplayMessageType.Normal);
    normalEntries.forEach((m) => {

      if (m.role === "user" || m.role === "assistant")
        msgs.push({ role: m.role, content: m.content });
    });

    return msgs;
  }, [memory, chatHistory]);

  const sendMessage = useCallback(async (input: string) => {
    const text = input.trim();

    if (!text || loading)
      return;

    const userMessage: ChatDisplayMessage = { role: "user", content: text, displayType: DisplayMessageType.Normal };
    setChatHistory((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const requestMessages = buildRequestMessages();
      requestMessages.push({ role: "user", content: text });
      const sentInCall = requestMessages.reduce((sum, m) => sum + countWords(m.content), 0);
      setWordCounts((prev) => ({ ...prev, lastSent: sentInCall, totalSent: prev.totalSent + sentInCall }));

      const response = await postChat(requestMessages, currentChatId, sendOptions.includeResponses, sendOptions.includeMemory);

      setCurrentChatId(response.chatId);
      const newDisplay: ChatDisplayMessage[] = response.messages
        .filter((m) => m.role === "assistant")
        .map((m) => ({ ...m, displayType: DisplayMessageType.Normal }));

      const receivedInCall = newDisplay.reduce((sum, m) => sum + countWords(m.content), 0);
      setWordCounts((prev) => ({ ...prev, lastReceived: receivedInCall, totalReceived: prev.totalReceived + receivedInCall }));
      setChatHistory((prev) => [...prev, ...newDisplay]);
    }
    catch (e) {
      setWordCounts((prev) => ({ ...prev, lastReceived: 0 }));
      const errorContent = e instanceof Error ? e.message : "Request failed";
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: errorContent, displayType: DisplayMessageType.Error },
      ]);
    }
    finally {
      setLoading(false);
    }
  }, [loading, buildRequestMessages, currentChatId, sendOptions, setCurrentChatId]);

  const regenerateLastResponse = useCallback(async () => {
    if (loading || chatHistory.length === 0)
      return;

    const last = chatHistory[chatHistory.length - 1];
    if (last.role !== "assistant" || last.displayType !== DisplayMessageType.Normal)
      return;

    const historyWithoutLast = chatHistory.slice(0, -1);
    const msgs: ChatMessage[] = [];

    if (memory.trim())
      msgs.push({ role: "system", content: memory.trim() });

    historyWithoutLast
      .filter((m) => m.displayType === DisplayMessageType.Normal && (m.role === "user" || m.role === "assistant"))
      .forEach((m) => msgs.push({ role: m.role, content: m.content }));

    setLoading(true);
    try {
      const response = await postChat(msgs, currentChatId, sendOptions.includeResponses, sendOptions.includeMemory);
      setCurrentChatId(response.chatId);
      const newDisplay: ChatDisplayMessage[] = response.messages
        .filter((m) => m.role === "assistant")
        .map((m) => ({ ...m, displayType: DisplayMessageType.Normal }));
      setChatHistory((prev) => [...prev.slice(0, -1), ...newDisplay]);
    }
    catch (e) {
      const errorContent = e instanceof Error ? e.message : "Request failed";
      setChatHistory((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: errorContent, displayType: DisplayMessageType.Error },
      ]);
    }
    finally {
      setLoading(false);
    }
  }, [loading, chatHistory, memory, currentChatId, sendOptions, setCurrentChatId]);

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
  }, [getChat, setCurrentChatId]);

  const startNewChat = useCallback(() => {
    setChatHistory([]);
    setCurrentChatId(null);
    setWordCounts({ lastSent: 0, lastReceived: 0, totalSent: 0, totalReceived: 0 });
  }, [setCurrentChatId]);

  const deleteMessage = useCallback((index: number) => {
    const newHistory = chatHistory.filter((_, idx) => idx !== index);
    setChatHistory(newHistory);

    if (currentChatId !== null) {
      const msgs: ChatMessage[] = [];

      if (memory.trim())
        msgs.push({ role: "system", content: memory.trim() });
      newHistory
        .filter((m) => m.displayType === DisplayMessageType.Normal && (m.role === "user" || m.role === "assistant"))
        .forEach((m) => msgs.push({ role: m.role, content: m.content }));
      putChatContent(currentChatId, msgs).catch(() => {});
    }
  }, [chatHistory, currentChatId, memory, putChatContent]);

  return {
    chatHistory,
    wordCounts,
    loading,
    sendMessage,
    regenerateLastResponse,
    loadSelectedChat,
    startNewChat,
    deleteMessage,
  };
}
