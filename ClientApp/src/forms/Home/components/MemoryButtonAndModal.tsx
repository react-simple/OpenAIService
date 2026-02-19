import React, { useState } from "react";
import { putMemory } from "services";
import { countWords, formatWithSuffix } from "utils";
import { Button, MemoryModal } from "components";

interface MemoryButtonAndModalProps {
  memory: string;
  onMemoryChange: (content: string) => void;
}

export const MemoryButtonAndModal = ({ memory, onMemoryChange }: MemoryButtonAndModalProps) => {
  const [open, setOpen] = useState(false);

  const handleSave = (content: string) => {
    putMemory(content)
      .then(() => {
        onMemoryChange(content);
        setOpen(false);
      })
      .catch(() => {
        setOpen(false);
      });
  };

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Memory ({formatWithSuffix(countWords(memory))})
      </Button>
      <MemoryModal
        open={open}
        onClose={() => setOpen(false)}
        initialValue={memory}
        onSave={handleSave}
      />
    </>
  );
};
