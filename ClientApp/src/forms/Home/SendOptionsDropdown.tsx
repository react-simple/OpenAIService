import React, { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "icons";
import * as Styled from "./Home.styles";

interface SendOptionsDropdownProps {
  includeResponses: boolean;
  includeMemory: boolean;
  onIncludeResponsesChange: (value: boolean) => void;
  onIncludeMemoryChange: (value: boolean) => void;
  disabled?: boolean;
}

export const SendOptionsDropdown = ({
  includeResponses,
  includeMemory,
  onIncludeResponsesChange,
  onIncludeMemoryChange,
  disabled = false,
}: SendOptionsDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open)
      return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current?.contains(e.target as Node))
        return;

      setOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape")
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <Styled.OptionsWrap ref={ref}>
      <Styled.OptionsTrigger
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        disabled={disabled}
        title="Send options"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </Styled.OptionsTrigger>
      {open && (
        <Styled.OptionsPopup>
          <Styled.CheckboxLabel>
            <input
              type="checkbox"
              checked={includeResponses}
              onChange={(e) => onIncludeResponsesChange(e.target.checked)}
            />
            Include responses
          </Styled.CheckboxLabel>
          <Styled.CheckboxLabel>
            <input
              type="checkbox"
              checked={includeMemory}
              onChange={(e) => onIncludeMemoryChange(e.target.checked)}
            />
            Include memory
          </Styled.CheckboxLabel>
        </Styled.OptionsPopup>
      )}
    </Styled.OptionsWrap>
  );
};
