import React, { useEffect, useRef } from "react";
import type { ChatDisplayMessage } from "types";
import { DisplayMessageType } from "types";
import * as Styled from "./Home.styles";
import { CopyButton } from "components";
import { CopyIcon, RefreshIcon, TrashIcon } from "icons";

interface MessageListProps {
  chatHistory: ChatDisplayMessage[];
  fontSize: number;
  loading: boolean;
  onRegenerateLastResponse: () => void;
  onDeleteMessage: (index: number) => void;
  onCopyMessage: (content: string) => void;
}

export const MessageList = ({
  chatHistory,
  fontSize,
  loading,
  onRegenerateLastResponse,
  onDeleteMessage,
  onCopyMessage,
}: MessageListProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [chatHistory]);

  return (
    <Styled.MessageList ref={listRef} $fontSizePx={fontSize}>
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
                <CopyButton type="button" onClick={onRegenerateLastResponse} title="Regenerate" disabled={loading}>
                  <RefreshIcon />
                </CopyButton>
              )}
              <CopyButton type="button" onClick={() => onDeleteMessage(i)} title="Delete message">
                <TrashIcon />
              </CopyButton>
              <CopyButton type="button" onClick={() => onCopyMessage(msg.content)} title="Copy">
                <CopyIcon />
              </CopyButton>
            </Styled.MessageActions>
          </Styled.MessageBlock>
        );
      })}
      {loading && <Styled.LoadingSpinner />}
    </Styled.MessageList>
  );
};
