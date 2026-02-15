import React, { useState, useCallback, useEffect, useRef } from "react";
import { postChat, getMemory, putMemory, getChat, getChats, putChat } from "functions";
import type { ChatMessage, ChatDisplayMessage } from "types";
import { DisplayMessageType } from "types";
import { countWords, formatWithSuffix } from "utils";
import * as Styled from "./Home.styles";
import { copyToClipboard } from "utils";
import {
  FONT_SIZE_STORAGE_KEY,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_DEFAULT,
} from "consts";
import { getStoredMemory, getStoredFontSize } from "./Home.utils";
import { Button, ChatsModal, CONFIRM_DELETE_MESSAGE, ConfirmationModal, CopyButton, MemoryModal, Toolbar } from "components";
import { CopyIcon, RefreshIcon, TrashIcon } from "icons";
export const Home = () => {
  const [chatHistory, setChatHistory] = useState<ChatDisplayMessage[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [memory, setMemory] = useState(() => getStoredMemory());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [chatsModalOpen, setChatsModalOpen] = useState(false);
  const [messageIndexToDelete, setMessageIndexToDelete] = useState<number | null>(null);
  const [lastSentWords, setLastSentWords] = useState(0);
  const [lastReceivedWords, setLastReceivedWords] = useState(0);
  const [totalSentWords, setTotalSentWords] = useState(0);
  const [totalReceivedWords, setTotalReceivedWords] = useState(0);
  const [fontSize, setFontSize] = useState(() => getStoredFontSize());
  const messageListRef = useRef<HTMLDivElement>(null);
  const hasLoadedLastChat = useRef(false);

  useEffect(() => {
    messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
  }, [chatHistory]);

  const closeMemoryModal = useCallback(() => {
    setMemoryModalOpen(false);
  }, []);

  const saveMemory = useCallback((content: string) => {
    putMemory(content)
      .then(() => {
        setMemory(content);
        setMemoryModalOpen(false);
      })
      .catch(() => {
        setMemory(content);
        setMemoryModalOpen(false);
      });
  }, []);

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
      setChatsModalOpen(false);
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
    setChatsModalOpen(false);
  }, []);

  useEffect(() => {
    getMemory()
      .then((data) => {

        if (data.content !== null)
          setMemory(data.content);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(fontSize));
    }
    catch {
      // ignore
    }
  }, [fontSize]);

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.max(FONT_SIZE_MIN, prev - 1));
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.min(FONT_SIZE_MAX, prev + 1));
  }, []);

  const resetFontSize = useCallback(() => {
    setFontSize(FONT_SIZE_DEFAULT);
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

      const response = await postChat(requestMessages, currentChatId);

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
  }, [input, loading, buildRequestMessages, currentChatId]);

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
      const response = await postChat(msgs, currentChatId);
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
  }, [loading, chatHistory, memory, currentChatId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Styled.Layout>
      <Toolbar
        fontSize={fontSize}
        onDecrease={decreaseFontSize}
        onIncrease={increaseFontSize}
        onReset={resetFontSize}
      />
      <Styled.MessageList ref={messageListRef} $fontSizePx={fontSize}>
        {chatHistory.map((msg, i) => {
          const variant =
            msg.displayType === DisplayMessageType.Error
              ? "error"
              : msg.role === "user"
                ? "user"
                : "assistant";
          const align = msg.role === "user" ? "end" : "start";
          const isLastAssistant = i === chatHistory.length - 1 && msg.role === "assistant" && msg.displayType === DisplayMessageType.Normal;
          return (
            <Styled.MessageBlock key={i} $align={align}>
              <Styled.MessageBubble $variant={variant}>
                {msg.content}
              </Styled.MessageBubble>
              <Styled.MessageActions>
                {isLastAssistant && (
                  <CopyButton type="button" onClick={regenerateLastResponse} title="Regenerate" disabled={loading}>
                    <RefreshIcon />
                  </CopyButton>
                )}
                <CopyButton type="button" onClick={() => setMessageIndexToDelete(i)} title="Delete message">
                  <TrashIcon />
                </CopyButton>
                <CopyButton type="button" onClick={() => handleCopyMessage(msg.content)} title="Copy">
                  <CopyIcon />
                </CopyButton>
              </Styled.MessageActions>
            </Styled.MessageBlock>
          );
        })}
      </Styled.MessageList>

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
          <Button type="button" onClick={() => setChatsModalOpen(true)}>
            Chats
          </Button>
          <Button type="button" onClick={() => setMemoryModalOpen(true)}>
            Memory ({formatWithSuffix(countWords(memory))})
          </Button>
          <Button $primary type="button" onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </Styled.SendRow>
      </Styled.InputArea>

      <ChatsModal
        open={chatsModalOpen}
        onClose={() => setChatsModalOpen(false)}
        onSelectChat={loadSelectedChat}
        onNewChat={startNewChat}
        currentChatId={currentChatId}
      />
      <ConfirmationModal
        open={messageIndexToDelete !== null}
        message={CONFIRM_DELETE_MESSAGE}
        onConfirm={() => {
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
        }}
        onCancel={() => setMessageIndexToDelete(null)}
      />
      <MemoryModal
        open={memoryModalOpen}
        onClose={closeMemoryModal}
        initialValue={memory}
        onSave={saveMemory}
      />
    </Styled.Layout>
  );
};
