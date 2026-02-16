import React from "react";
import { CONFIRM_DELETE_MESSAGE, ConfirmationModal } from "components";

interface ConfirmDeleteMessageModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteMessageModal = ({ open, onConfirm, onCancel }: ConfirmDeleteMessageModalProps) => (
  <ConfirmationModal
    open={open}
    message={CONFIRM_DELETE_MESSAGE}
    onConfirm={onConfirm}
    onCancel={onCancel}
  />
);
