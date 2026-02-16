import { useCallback, useState } from "react";
import { deleteChat, getChats } from "services";
import type { ChatListItem } from "types";

export interface UseChatsReturn {
  chats: ChatListItem[];
  loading: boolean;
  error: string | null;
  loadChats: () => void;
  deleteChat: (chatId: number) => Promise<void>;
}

export function useChats(): UseChatsReturn {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChats = useCallback(() => {
    setLoading(true);
    setError(null);
    getChats()
      .then(setChats)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load chats"))
      .finally(() => setLoading(false));
  }, []);

  const deleteChatById = useCallback(async (chatId: number) => {
    try {
      await deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.chatId !== chatId));
    }
    catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete chat");
    }
  }, []);

  return {
    chats,
    loading,
    error,
    loadChats,
    deleteChat: deleteChatById,
  };
}
