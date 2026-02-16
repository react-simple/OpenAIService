import React, { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "icons";
import * as Styled from "../Home.styles";
import type { SendOptions } from "../Home.types";

interface SendOptionsDropdownProps {
  options: SendOptions;
  onOptionsChange: (next: Partial<SendOptions>) => void;
  disabled?: boolean;
}

export const SendOptionsDropdown = ({
  options,
  onOptionsChange,
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
              checked={options.includeResponses}
              onChange={(e) => onOptionsChange({ includeResponses: e.target.checked })}
            />
            Include responses
          </Styled.CheckboxLabel>
          <Styled.CheckboxLabel>
            <input
              type="checkbox"
              checked={options.includeMemory}
              onChange={(e) => onOptionsChange({ includeMemory: e.target.checked })}
            />
            Include memory
          </Styled.CheckboxLabel>
        </Styled.OptionsPopup>
      )}
    </Styled.OptionsWrap>
  );
};
