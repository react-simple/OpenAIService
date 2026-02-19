import React, { useEffect, useRef } from "react";
import type { ChatDisplayMessage } from "types";
import { DisplayMessageType } from "types";
import { copyToClipboard } from "utils";
import * as Styled from "../Home.styles";
import { IconButton } from "components";
import { CopyIcon, RefreshIcon, TrashIcon } from "icons";

interface MessageListProps {
  chatHistory: ChatDisplayMessage[];
  fontSize: number;
  loading: boolean;
  onRegenerateLastResponse: () => void;
  onDeleteMessage: (index: number) => void;
}

export const MessageList = ({
  chatHistory,
  fontSize,
  loading,
  onRegenerateLastResponse,
  onDeleteMessage,
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
                <IconButton type="button" onClick={onRegenerateLastResponse} title="Regenerate" disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              )}
              <IconButton type="button" onClick={() => onDeleteMessage(i)} title="Delete message">
                <TrashIcon />
              </IconButton>
              <IconButton type="button" onClick={() => void copyToClipboard(msg.content)} title="Copy">
                <CopyIcon />
              </IconButton>
            </Styled.MessageActions>
          </Styled.MessageBlock>
        );
      })}
      {loading && <Styled.LoadingSpinner />}
    </Styled.MessageList>
  );
};
