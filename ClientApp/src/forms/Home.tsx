import React, { useState, useCallback } from "react";
import { postChat } from "functions";
import type { ChatMessage, ChatDisplayMessage } from "types";
import { DisplayMessageType } from "types";
import * as Styled from "./Home.styles";

const MEMORY_UPDATED_PLACEHOLDER = "Memory updated";

export const Home = () => {
  const [chatHistory, setChatHistory] = useState<ChatDisplayMessage[]>([]);
  const [memory, setMemory] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [memoryModalOpen, setMemoryModalOpen] = useState(false);

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
      const response = await postChat(requestMessages);

      const newDisplay: ChatDisplayMessage[] = [];

      for (const m of response.messages) {
        if (m.role === "system") {
          setMemory(m.content);
          newDisplay.push({
            role: "assistant",
            content: MEMORY_UPDATED_PLACEHOLDER,
            displayType: DisplayMessageType.MemoryPlaceholder,
          });
        }
        else if (m.role === "assistant") {
          newDisplay.push({ ...m, displayType: DisplayMessageType.Normal });
        }
      }

      setChatHistory((prev) => [...prev, ...newDisplay]);
    }
    catch (e) {
      const errorContent = e instanceof Error ? e.message : "Request failed";
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: errorContent, displayType: DisplayMessageType.Error },
      ]);
    }
    finally {
      setLoading(false);
    }
  }, [input, loading, buildRequestMessages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Styled.Layout>
      <Styled.MessageList>
        {chatHistory.map((msg, i) => {
          const variant =
            msg.displayType === DisplayMessageType.Error
              ? "error"
              : msg.role === "user"
                ? "user"
                : "assistant";
          return (
            <Styled.MessageBubble key={i} $variant={variant}>
              {msg.content}
            </Styled.MessageBubble>
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
          <Styled.Button type="button" onClick={() => setMemoryModalOpen(true)}>
            Memory
          </Styled.Button>
          <Styled.Button $primary type="button" onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? "Sending..." : "Send"}
          </Styled.Button>
        </Styled.SendRow>
      </Styled.InputArea>

      {memoryModalOpen && (
        <Styled.Overlay onClick={() => setMemoryModalOpen(false)}>
          <Styled.Modal onClick={(e) => e.stopPropagation()}>
            <Styled.ModalHeader>
              Memory
              <Styled.Button type="button" onClick={() => setMemoryModalOpen(false)}>
                Close
              </Styled.Button>
            </Styled.ModalHeader>
            <Styled.ModalBody>{memory || "(empty)"}</Styled.ModalBody>
          </Styled.Modal>
        </Styled.Overlay>
      )}
    </Styled.Layout>
  );
};
