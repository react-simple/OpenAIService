import React, { useState, useCallback, useEffect, useRef } from "react";
import { postChat, getMemory, getChat, getChats, putChat } from "functions";
import type { ChatMessage, ChatDisplayMessage } from "types";
import { DisplayMessageType } from "types";
import { countWords, formatWithSuffix } from "utils";
import * as Styled from "./Home.styles";
import { copyToClipboard } from "utils";
import { getStoredMemory } from "./Home.utils";
import { Button, Toolbar, useFontSize } from "components";
import { ChatsButtonAndModal } from "./ChatsButtonAndModal";
import { ConfirmDeleteMessageModal } from "./ConfirmDeleteMessageModal";
import { MemoryButtonAndModal } from "./MemoryButtonAndModal";
import { MessageList } from "./MessageList";
import { SendOptionsDropdown } from "./SendOptionsDropdown";

export const Home = () => {
  const [chatHistory, setChatHistory] = useState<ChatDisplayMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [memory, setMemory] = useState(() => getStoredMemory());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageIndexToDelete, setMessageIndexToDelete] = useState<number | null>(null);
  const [lastSentWords, setLastSentWords] = useState(0);
  const [lastReceivedWords, setLastReceivedWords] = useState(0);
  const [totalSentWords, setTotalSentWords] = useState(0);
  const [totalReceivedWords, setTotalReceivedWords] = useState(0);
  const [includeResponses, setIncludeResponses] = useState(true);
  const [includeMemory, setIncludeMemory] = useState(true);
  const hasLoadedLastChat = useRef(false);

  const loadSelectedChat = useCallback((chatId: number) => {
    getChat(chatId).then((chat) => {
      const content = chat.content ?? [];
      // Only Normal entries are saved to the DB, so no need to filter by role.
      const displayHistory: ChatDisplayMessage[] = content.map((m) => ({
        ...m,
        displayType: DisplayMessageType.Normal,
      }));

      setChatHistory(displayHistory);
      setCurrentChatId(chat.chatId);
      setLastSentWords(0);
      setLastReceivedWords(0);
      setTotalSentWords(0);
      setTotalReceivedWords(0);
    });
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

  const startNewChat = useCallback(() => {
    setChatHistory([]);
    setCurrentChatId(null);
    setLastSentWords(0);
    setLastReceivedWords(0);
    setTotalSentWords(0);
    setTotalReceivedWords(0);
  }, []);

  useEffect(() => {
    getMemory()
      .then((data) => {

        if (data.content !== null)
          setMemory(data.content);
      })
      .catch(() => {});
  }, []);

  const handleCopyMessage = useCallback(async (content: string) => {
    await copyToClipboard(content);
  }, []);

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

  const sendMessage = useCallback(async () => {
    const text = input.trim();

    if (!text || loading)
      return;

    const userMessage: ChatDisplayMessage = { role: "user", content: text, displayType: DisplayMessageType.Normal };
    setChatHistory((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const requestMessages = buildRequestMessages();
      requestMessages.push({ role: "user", content: text });
      const sentInCall = requestMessages.reduce((sum, m) => sum + countWords(m.content), 0);
      setLastSentWords(sentInCall);
      setTotalSentWords((prev) => prev + sentInCall);

      const response = await postChat(requestMessages, currentChatId, includeResponses, includeMemory);

      setCurrentChatId(response.chatId);
      const newDisplay: ChatDisplayMessage[] = response.messages
        .filter((m) => m.role === "assistant")
        .map((m) => ({ ...m, displayType: DisplayMessageType.Normal }));

      const receivedInCall = newDisplay.reduce((sum, m) => sum + countWords(m.content), 0);
      setLastReceivedWords(receivedInCall);
      setTotalReceivedWords((prev) => prev + receivedInCall);
      setChatHistory((prev) => [...prev, ...newDisplay]);
    }
    catch (e) {
      setLastReceivedWords(0);
      const errorContent = e instanceof Error ? e.message : "Request failed";
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: errorContent, displayType: DisplayMessageType.Error },
      ]);
    }
    finally {
      setLoading(false);
    }
  }, [input, loading, buildRequestMessages, currentChatId, includeResponses, includeMemory]);

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
      const response = await postChat(msgs, currentChatId, includeResponses, includeMemory);
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
  }, [loading, chatHistory, memory, currentChatId, includeResponses, includeMemory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleConfirmDeleteMessage = useCallback(() => {
    if (messageIndexToDelete === null)
      return;

    const newHistory = chatHistory.filter((_, idx) => idx !== messageIndexToDelete);
    setChatHistory(newHistory);
    setMessageIndexToDelete(null);

    if (currentChatId !== null) {
      const msgs: ChatMessage[] = [];
      if (memory.trim())
        msgs.push({ role: "system", content: memory.trim() });
      newHistory
        .filter((m) => m.displayType === DisplayMessageType.Normal && (m.role === "user" || m.role === "assistant"))
        .forEach((m) => msgs.push({ role: m.role, content: m.content }));
      putChat(currentChatId, msgs).catch(() => {});
    }
  }, [messageIndexToDelete, chatHistory, currentChatId, memory]);

  const { fontSize } = useFontSize();

  return (
    <Styled.Layout>
      <Toolbar />
      <MessageList
        chatHistory={chatHistory}
        fontSize={fontSize}
        loading={loading}
        onRegenerateLastResponse={regenerateLastResponse}
        onDeleteMessage={setMessageIndexToDelete}
        onCopyMessage={handleCopyMessage}
      />

      <Styled.InputArea>
        <Styled.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={loading}
        />
        <Styled.SendRow>
          <Styled.SentReceivedLabel>
            Sent: {formatWithSuffix(lastSentWords)} ({formatWithSuffix(totalSentWords)} total) &nbsp; Received: {formatWithSuffix(lastReceivedWords)} ({formatWithSuffix(totalReceivedWords)} total)
          </Styled.SentReceivedLabel>
          <ChatsButtonAndModal
            currentChatId={currentChatId}
            onSelectChat={loadSelectedChat}
            onNewChat={startNewChat}
          />
          <MemoryButtonAndModal memory={memory} onMemoryChange={setMemory} />
          <Button $primary type="button" onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? "Sending..." : "Send"}
          </Button>
          <SendOptionsDropdown
            includeResponses={includeResponses}
            includeMemory={includeMemory}
            onIncludeResponsesChange={setIncludeResponses}
            onIncludeMemoryChange={setIncludeMemory}
            disabled={loading}
          />
        </Styled.SendRow>
      </Styled.InputArea>

      <ConfirmDeleteMessageModal
        open={messageIndexToDelete !== null}
        onConfirm={handleConfirmDeleteMessage}
        onCancel={() => setMessageIndexToDelete(null)}
      />
    </Styled.Layout>
  );
};
