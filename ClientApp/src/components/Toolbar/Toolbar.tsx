import React from "react";
import { Button } from "components/Button";
import * as ToolbarStyled from "./Toolbar.styles";
import { FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_DEFAULT } from "consts";

interface ToolbarProps {
  fontSize: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onReset: () => void;
}

export const Toolbar = ({ fontSize, onDecrease, onIncrease, onReset }: ToolbarProps) => {
  return (
    <ToolbarStyled.Toolbar>
      <Button
        type="button"
        onClick={onDecrease}
        disabled={fontSize <= FONT_SIZE_MIN}
        title="Decrease font size"
      >
        A−
      </Button>
      <Button
        type="button"
        onClick={onIncrease}
        disabled={fontSize >= FONT_SIZE_MAX}
        title="Increase font size"
      >
        A+
      </Button>
      <Button
        type="button"
        onClick={onReset}
        disabled={fontSize === FONT_SIZE_DEFAULT}
        title="Reset font size"
      >
        A↺
      </Button>
    </ToolbarStyled.Toolbar>
  );
};
