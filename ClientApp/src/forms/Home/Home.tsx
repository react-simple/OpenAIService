import React, { useEffect, useRef, useState } from "react";
import { formatWithSuffix } from "utils";
import * as Styled from "./Home.styles";
import {
  ChatsButtonAndModal,
  ConfirmDeleteMessageModal,
  MemoryButtonAndModal,
  MessageList,
  SendOptionsDropdown,
} from "./components";
import { useChats, useChat } from "hooks";
import { getMemory } from "services";
import { getStoredMemory } from "functions";
import type { SendOptions } from "hooks";
import { Button, Toolbar } from "components";
import { useFontSize } from "hooks";

export const Home = () => {
  const [input, setInput] = useState("");
  const [messageIndexToDelete, setMessageIndexToDelete] = useState<number | null>(null);
  const [memory, setMemory] = useState(() => getStoredMemory());
  const [sendOptions, setSendOptions] = useState<SendOptions>({ includeResponses: true, includeMemory: true });

  const chats = useChats();
  const chat = useChat({
    chats,
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
    chats.getChats()
      .then((list) => {

        if (list.length > 0)
          chat.loadChat(list[0].chatId);
      })
      .catch(() => {});
    // Intentionally run once on mount to load most recent chat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        chat.sendMessage(input);
        setInput("");
      }
    }
  };

  const { fontSize } = useFontSize();

  return (
    <Styled.Layout>
      <Toolbar />
      <MessageList
        chatHistory={chat.chatHistory}
        fontSize={fontSize}
        loading={chat.loading}
        onRegenerateLastResponse={chat.regenerateLastResponse}
        onDeleteMessage={setMessageIndexToDelete}
      />

      <Styled.InputArea>
        <Styled.TextArea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={chat.loading}
        />
        <Styled.SendRow>
          <Styled.SentReceivedLabel>
            Sent: {formatWithSuffix(chat.wordCounts.lastSent)} ({formatWithSuffix(chat.wordCounts.totalSent)} total) &nbsp; Received: {formatWithSuffix(chat.wordCounts.lastReceived)} ({formatWithSuffix(chat.wordCounts.totalReceived)} total)
          </Styled.SentReceivedLabel>
          <ChatsButtonAndModal
            currentChatId={chats.currentChatId}
            onSelectChat={chat.loadChat}
            onNewChat={chat.startNewChat}
          />
          <MemoryButtonAndModal memory={memory} onMemoryChange={setMemory} />
          <Button
            $primary
            type="button"
            onClick={() => {
              if (input.trim()) {
                chat.sendMessage(input);
                setInput("");
              }
            }}
            disabled={chat.loading || !input.trim()}
          >
            {chat.loading ? "Sending..." : "Send"}
          </Button>
          <SendOptionsDropdown
            options={sendOptions}
            onOptionsChange={(next) => setSendOptions((prev) => ({ ...prev, ...next }))}
            disabled={chat.loading}
          />
        </Styled.SendRow>
      </Styled.InputArea>

      <ConfirmDeleteMessageModal
        open={messageIndexToDelete !== null}
        onConfirm={() => {
          if (messageIndexToDelete !== null) {
            chat.deleteMessage(messageIndexToDelete);
            setMessageIndexToDelete(null);
          }
        }}
        onCancel={() => setMessageIndexToDelete(null)}
      />
    </Styled.Layout>
  );
};
