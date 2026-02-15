import React, { useEffect, useState } from "react";
import { getChats, deleteChat } from "functions";
import type { ChatListItem as ChatListItemType } from "types";
import { formatChatUpdate } from "utils/formatting";
import { Button } from "components/Button";
import { TrashIcon } from "icons";
import * as Modal from "components/Modal";
import * as Styled from "./ChatsModal.styles";

interface ChatsModalProps {
  open: boolean;
  onClose: () => void;
  onSelectChat: (chatId: number) => void;
  onNewChat?: () => void;
  currentChatId?: number | null;
}

export const ChatsModal = ({ open, onClose, onSelectChat, onNewChat, currentChatId = null }: ChatsModalProps) => {
  const [list, setList] = useState<ChatListItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(null);
    getChats()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load chats"))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const handleSelect = (chatId: number) => {
    onSelectChat(chatId);
    onClose();
  };

  const handleNewChat = () => {
    onNewChat?.();
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    deleteChat(chatId)
      .then(() => {
        setList((prev) => prev.filter((c) => c.chatId !== chatId));
        if (currentChatId === chatId)
          onNewChat?.();
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to delete chat"));
  };

  return (
    <Modal.Overlay onClick={onClose}>
      <Modal.Modal onClick={(e) => e.stopPropagation()}>
        <Modal.ModalHeader>
          <span>Chats</span>
        </Modal.ModalHeader>
        <Modal.ModalBody>
          {loading && <p>Loading…</p>}
          {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
          {!loading && !error && list.length === 0 && <p>No chats yet.</p>}
          {!loading && !error && list.length > 0 && (
            <Styled.ChatList>
              {list.map((chat) => (
                <Styled.ChatListItem key={chat.chatId} onClick={() => handleSelect(chat.chatId)}>
                  <Styled.ChatItemContent>
                    <Styled.ChatTitle>{chat.title}</Styled.ChatTitle>
                    <Styled.ChatDate>{formatChatUpdate(chat.chatUpdate)}</Styled.ChatDate>
                  </Styled.ChatItemContent>
                  <Styled.DeleteButton
                    type="button"
                    onClick={(e) => handleDelete(e, chat.chatId)}
                    title="Delete chat"
                  >
                    <TrashIcon />
                  </Styled.DeleteButton>
                </Styled.ChatListItem>
              ))}
            </Styled.ChatList>
          )}
        </Modal.ModalBody>
        <Modal.ModalFooter>
          {onNewChat && (
            <Button type="button" onClick={handleNewChat}>
              New Chat
            </Button>
          )}
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </Modal.ModalFooter>
      </Modal.Modal>
    </Modal.Overlay>
  );
};
