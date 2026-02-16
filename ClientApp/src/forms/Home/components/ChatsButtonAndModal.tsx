import React, { useState } from "react";
import { Button, ChatsModal } from "components";

interface ChatsButtonAndModalProps {
  currentChatId: number | null;
  onSelectChat: (chatId: number) => void;
  onNewChat: () => void;
}

export const ChatsButtonAndModal = ({ currentChatId, onSelectChat, onNewChat }: ChatsButtonAndModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Chats
      </Button>
      <ChatsModal
        open={open}
        onClose={() => setOpen(false)}
        onSelectChat={onSelectChat}
        onNewChat={onNewChat}
        currentChatId={currentChatId}
      />
    </>
  );
};
