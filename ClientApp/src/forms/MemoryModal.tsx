import React, { useState, useEffect } from "react";
import { countWords, formatWithSuffix } from "utils";
import { copyToClipboard } from "utils";
import { CopyIcon } from "./Home.utils";
import * as Styled from "./Home.styles";

interface MemoryModalProps {
  open: boolean;
  onClose: () => void;
  initialValue: string;
  onSave: (content: string) => void;
}

export const MemoryModal = ({ open, onClose, initialValue, onSave }: MemoryModalProps) => {
  const [draft, setDraft] = useState(initialValue);

  useEffect(() => {
    if (open) setDraft(initialValue);
  }, [open, initialValue]);

  if (!open) return null;

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  const handleCopy = () => {
    copyToClipboard(draft);
  };

  return (
    <Styled.Overlay onClick={onClose}>
      <Styled.Modal onClick={(e) => e.stopPropagation()}>
        <Styled.ModalHeader>
          <span>Memory — {formatWithSuffix(countWords(draft))} words</span>
          <Styled.CopyButton type="button" onClick={handleCopy} title="Copy memory">
            <CopyIcon />
          </Styled.CopyButton>
        </Styled.ModalHeader>
        <Styled.ModalBody>
          <Styled.MemoryTextArea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type or paste context the assistant should remember (sent as system message)."
          />
        </Styled.ModalBody>
        <Styled.ModalFooter>
          <Styled.Button type="button" onClick={onClose}>
            Cancel
          </Styled.Button>
          <Styled.Button $primary type="button" onClick={handleSave}>
            Save
          </Styled.Button>
        </Styled.ModalFooter>
      </Styled.Modal>
    </Styled.Overlay>
  );
};
