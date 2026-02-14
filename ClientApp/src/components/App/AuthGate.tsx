import React from "react";
import { useAuth } from "contexts/AuthContext";
import { PinDialog } from "forms/PinDialog";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, validatePin } = useAuth();

  if (!isAuthenticated)
    return <PinDialog onValidate={validatePin} />;

  return <>{children}</>;
};
