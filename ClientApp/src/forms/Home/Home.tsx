import React, { useState, useCallback, useEffect } from "react";
import { postChat } from "functions";
import type { ChatMessage, ChatDisplayMessage } from "types";
import { DisplayMessageType } from "types";
import { countWords, formatWithSuffix } from "utils";
import * as Styled from "./Home.styles";
import { copyToClipboard } from "utils";
import {
  MEMORY_STORAGE_KEY,
  FONT_SIZE_STORAGE_KEY,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_DEFAULT,
} from "consts";
import { getStoredMemory, getStoredFontSize } from "./Home.utils";
import { Button } from "components/Button";
import { CopyButton } from "components/CopyButton";
import { CopyIcon } from "icons";
import { MemoryModal } from "components/MemoryModal";
import { Toolbar } from "components/Toolbar";
import { useAuth } from "contexts/AuthContext";

export const Home = () => {
  const { pin } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatDisplayMessage[]>([]);
  const [memory, setMemory] = useState(() => getStoredMemory());
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);
  const [lastSentWords, setLastSentWords] = useState(0);
  const [lastReceivedWords, setLastReceivedWords] = useState(0);
  const [totalSentWords, setTotalSentWords] = useState(0);
  const [totalReceivedWords, setTotalReceivedWords] = useState(0);
  const [fontSize, setFontSize] = useState(() => getStoredFontSize());

  const closeMemoryModal = useCallback(() => {
    setMemoryModalOpen(false);
  }, []);

  const saveMemory = useCallback((content: string) => {
    setMemory(content);
    setMemoryModalOpen(false);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, memory);
    }
    catch {
      // ignore quota or disabled localStorage
    }
  }, [memory]);

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
    if (memory.trim()) msgs.push({ role: "system", content: memory.trim() });

    chatHistory.forEach((m) => {
      if (m.displayType !== DisplayMessageType.Normal) return;

      if (m.role === "user" || m.role === "assistant") msgs.push({ role: m.role, content: m.content });
    });
    return msgs;
  }, [memory, chatHistory]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

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

      const response = await postChat(requestMessages, pin!);

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
  }, [input, loading, buildRequestMessages, pin]);

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
      <Styled.MessageList $fontSizePx={fontSize}>
        {chatHistory.map((msg, i) => {
          const variant =
            msg.displayType === DisplayMessageType.Error
              ? "error"
              : msg.role === "user"
                ? "user"
                : "assistant";
          const align = msg.role === "user" ? "end" : "start";
          return (
            <Styled.MessageBlock key={i} $align={align}>
              <Styled.MessageBubble $variant={variant}>
                {msg.content}
              </Styled.MessageBubble>
              <CopyButton type="button" onClick={() => handleCopyMessage(msg.content)} title="Copy">
                <CopyIcon />
              </CopyButton>
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
          <Button type="button" onClick={() => setMemoryModalOpen(true)}>
            Memory ({countWords(memory)})
          </Button>
          <Button $primary type="button" onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? "Sending..." : "Send"}
          </Button>
        </Styled.SendRow>
      </Styled.InputArea>

      <MemoryModal
        open={memoryModalOpen}
        onClose={closeMemoryModal}
        initialValue={memory}
        onSave={saveMemory}
      />
    </Styled.Layout>
  );
};
