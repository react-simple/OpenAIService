import React, { useCallback, useEffect, useState } from "react";
import { formatChatUpdate } from "utils/formatting";
import { Button, CONFIRM_DELETE_MESSAGE, ConfirmationModal, Modal } from "components";
import { useChats } from "hooks";
import type { ChatListItem } from "services/chatsApi";
import { TrashIcon } from "icons";
import * as Styled from "./ChatsModal.styles";

interface ChatsModalProps {
  open: boolean;
  onClose: () => void;
  onSelectChat: (chatId: number) => void;
  onNewChat?: () => void;
  currentChatId?: number | null;
}

export const ChatsModal = ({ open, onClose, onSelectChat, onNewChat, currentChatId = null }: ChatsModalProps) => {
  const chatsApi = useChats();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteChatId, setPendingDeleteChatId] = useState<number | null>(null);

  const loadChats = useCallback(() => {
    setLoading(true);
    setError(null);
    chatsApi.getChats()
      .then(setChats)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load chats"))
      .finally(() => setLoading(false));
  }, [chatsApi.getChats]);

  useEffect(() => {
    if (!open)
      return;

    loadChats();
  }, [open, loadChats]);

  if (!open) return null;

  const handleSelect = (chatId: number) => {
    onSelectChat(chatId);
    onClose();
  };

  const handleNewChat = () => {
    onNewChat?.();
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent, chatId: number) => {
    e.stopPropagation();
    setPendingDeleteChatId(chatId);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteChatId === null)
      return;

    const chatId = pendingDeleteChatId;
    setPendingDeleteChatId(null);
    chatsApi.deleteChat(chatId).then(() => {
      setChats((prev) => prev.filter((c) => c.chatId !== chatId));
      if (currentChatId === chatId)
        onNewChat?.();
    }).catch((e) => setError(e instanceof Error ? e.message : "Failed to delete chat"));
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
          {!loading && !error && chats.length === 0 && <p>No chats yet.</p>}
          {!loading && !error && chats.length > 0 && (
            <Styled.ChatList>
              {chats.map((chat) => (
                <Styled.ChatListItem key={chat.chatId} onClick={() => handleSelect(chat.chatId)}>
                  <Styled.ChatItemContent>
                    <Styled.ChatTitle>{chat.title}{chat.chatId === currentChatId ? " (current)" : ""}</Styled.ChatTitle>
                    <Styled.ChatDate>{formatChatUpdate(chat.chatUpdate)}</Styled.ChatDate>
                  </Styled.ChatItemContent>
                  <Styled.DeleteButton
                    type="button"
                    onClick={(e) => handleDeleteClick(e, chat.chatId)}
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
      <ConfirmationModal
        open={pendingDeleteChatId !== null}
        message={CONFIRM_DELETE_MESSAGE}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteChatId(null)}
      />
    </Modal.Overlay>
  );
};
