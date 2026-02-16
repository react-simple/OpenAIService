import React from "react";
import { Button, CopyButton } from "components";
import { LogoutIcon } from "icons";
import { useAuth } from "contexts/AuthContext";
import * as ToolbarStyled from "./Toolbar.styles";
import { FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_DEFAULT } from "consts";
import { useFontSize } from "./FontSizeContext";

export const Toolbar = () => {
  const { user, logout } = useAuth();
  const { fontSize, decreaseFontSize, increaseFontSize, resetFontSize } = useFontSize();

  return (
    <ToolbarStyled.Toolbar>
      <Button
        type="button"
        onClick={decreaseFontSize}
        disabled={fontSize <= FONT_SIZE_MIN}
        title="Decrease font size"
      >
        A−
      </Button>
      <Button
        type="button"
        onClick={increaseFontSize}
        disabled={fontSize >= FONT_SIZE_MAX}
        title="Increase font size"
      >
        A+
      </Button>
      <Button
        type="button"
        onClick={resetFontSize}
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
