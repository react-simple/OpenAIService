import React, { useState, useEffect } from "react";
import { countWords, formatWithSuffix } from "utils";
import { copyToClipboard } from "utils";
import { Button, CopyButton, Modal } from "components";
import { CopyIcon } from "icons";

interface MemoryModalProps {
  open: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (content: string) => void;
}

export const MemoryModal = ({ open, onClose, initialValue, onSave }: MemoryModalProps) => {
  const [draft, setDraft] = useState(initialValue);

  useEffect(() => {

    if (open)
      setDraft(initialValue);
  }, [open, initialValue]);

  if (!open)
    return null;

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const handleCopy = () => {
    copyToClipboard(draft);
  };

  return (
    <Modal.Overlay onClick={onClose}>
      <Modal.Modal onClick={(e) => e.stopPropagation()}>
        <Modal.ModalHeader>
          <span>Memory — {formatWithSuffix(countWords(draft))} words</span>
          <CopyButton type="button" onClick={handleCopy} title="Copy memory">
            <CopyIcon />
          </CopyButton>
        </Modal.ModalHeader>
        <Modal.ModalBody>
          <Modal.MemoryTextArea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type or paste context the assistant should remember (sent as system message)."
          />
        </Modal.ModalBody>
        <Modal.ModalFooter>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button $primary type="button" onClick={handleSave}>
            Save
          </Button>
        </Modal.ModalFooter>
      </Modal.Modal>
    </Modal.Overlay>
  );
};
