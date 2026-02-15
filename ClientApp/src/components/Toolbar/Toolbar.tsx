import React from "react";
import { Button } from "components/Button";
import { CopyButton } from "components/CopyButton";
import { LogoutIcon } from "icons";
import { useAuth } from "contexts/AuthContext";
import * as ToolbarStyled from "./Toolbar.styles";
import { FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_DEFAULT } from "consts";

interface ToolbarProps {
  fontSize: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onReset: () => void;
}

export const Toolbar = ({ fontSize, onDecrease, onIncrease, onReset }: ToolbarProps) => {
  const { user, logout } = useAuth();

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
      <ToolbarStyled.ToolbarSpacer />
      {user?.email && (
        <ToolbarStyled.UserEmail title={user.email}>{user.email}</ToolbarStyled.UserEmail>
      )}
      <CopyButton type="button" onClick={logout} title="Logout">
        <LogoutIcon />
      </CopyButton>
    </ToolbarStyled.Toolbar>
  );
};
