import React, { useState } from "react";
import { formatWithSuffix } from "utils";
import * as Styled from "./Home.styles";
import {
  ChatsButtonAndModal,
  ConfirmDeleteMessageModal,
  MemoryButtonAndModal,
  MessageList,
  SendOptionsDropdown,
} from "./components";
import { useChat } from "hooks";
import { Button, Toolbar, useFontSize } from "components";

export const Home = () => {
  const [input, setInput] = useState("");
  const [messageIndexToDelete, setMessageIndexToDelete] = useState<number | null>(null);

  const {
    memory,
    setMemory,
    chatHistory,
    currentChatId,
    sendOptions,
    setSendOptions,
    wordCounts,
    loading,
    sendMessage,
    regenerateLastResponse,
    loadSelectedChat,
    startNewChat,
    deleteMessage,
  } = useChat();

  const handleKeyDown = (e: React.KeyboardEvent) => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        sendMessage(input);
        setInput("");
      }
    }
  };

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
            Sent: {formatWithSuffix(wordCounts.lastSent)} ({formatWithSuffix(wordCounts.totalSent)} total) &nbsp; Received: {formatWithSuffix(wordCounts.lastReceived)} ({formatWithSuffix(wordCounts.totalReceived)} total)
          </Styled.SentReceivedLabel>
          <ChatsButtonAndModal
            currentChatId={currentChatId}
            onSelectChat={loadSelectedChat}
            onNewChat={startNewChat}
          />
          <MemoryButtonAndModal memory={memory} onMemoryChange={setMemory} />
          <Button
            $primary
            type="button"
            onClick={() => {
              if (input.trim()) {
                sendMessage(input);
                setInput("");
              }
            }}
            disabled={loading || !input.trim()}
          >
            {loading ? "Sending..." : "Send"}
          </Button>
          <SendOptionsDropdown
            options={sendOptions}
            onOptionsChange={(next) => setSendOptions((prev) => ({ ...prev, ...next }))}
            disabled={loading}
          />
        </Styled.SendRow>
      </Styled.InputArea>

      <ConfirmDeleteMessageModal
        open={messageIndexToDelete !== null}
        onConfirm={() => {
          if (messageIndexToDelete !== null) {
            deleteMessage(messageIndexToDelete);
            setMessageIndexToDelete(null);
          }
        }}
        onCancel={() => setMessageIndexToDelete(null)}
      />
    </Styled.Layout>
  );
};
