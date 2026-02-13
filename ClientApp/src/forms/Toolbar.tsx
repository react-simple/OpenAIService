import React from "react";
import * as Styled from "./Home.styles";
import * as ToolbarStyled from "./Toolbar.styles";
import { FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_DEFAULT } from "./Home.utils";

interface ToolbarProps {
  fontSize: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onReset: () => void;
}

export const Toolbar = ({ fontSize, onDecrease, onIncrease, onReset }: ToolbarProps) => {
  return (
    <ToolbarStyled.Toolbar>
      <Styled.Button
        type="button"
        onClick={onDecrease}
        disabled={fontSize <= FONT_SIZE_MIN}
        title="Decrease font size"
      >
        A−
      </Styled.Button>
      <Styled.Button
        type="button"
        onClick={onIncrease}
        disabled={fontSize >= FONT_SIZE_MAX}
        title="Increase font size"
      >
        A+
      </Styled.Button>
      <Styled.Button
        type="button"
        onClick={onReset}
        disabled={fontSize === FONT_SIZE_DEFAULT}
        title="Reset font size"
      >
        A↺
      </Styled.Button>
    </ToolbarStyled.Toolbar>
  );
};
