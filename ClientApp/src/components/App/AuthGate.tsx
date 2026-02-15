import React from "react";
import { useAuth } from "contexts/AuthContext";
import { Button } from "components/Button";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading)
    return null;

  if (!isAuthenticated)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", gap: "1rem" }}>
        <Button $primary type="button" onClick={login}>
          Login with Google
        </Button>
      </div>
    );

  return <>{children}</>;
};
