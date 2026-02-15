import React from "react";
import { Button, Modal } from "components";

export const CONFIRM_DELETE_MESSAGE = "Are you sure you want to delete this?";

interface ConfirmationModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal = ({ open, message, onConfirm, onCancel }: ConfirmationModalProps) => {
  if (!open)
    return null;

  return (
    <Modal.Overlay onClick={onCancel}>
      <Modal.Modal onClick={(e) => e.stopPropagation()} style={{ maxHeight: "none", height: "auto" }}>
        <Modal.ModalHeader>
          <span>Confirm</span>
        </Modal.ModalHeader>
        <Modal.ModalBody>
          <p style={{ margin: 0 }}>{message}</p>
        </Modal.ModalBody>
        <Modal.ModalFooter>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button $primary type="button" onClick={onConfirm}>
            Delete
          </Button>
        </Modal.ModalFooter>
      </Modal.Modal>
    </Modal.Overlay>
  );
};
