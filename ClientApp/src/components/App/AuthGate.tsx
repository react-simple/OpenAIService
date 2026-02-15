import React from "react";
import { useAuth } from "contexts/AuthContext";
import { Button } from "components";

export const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading)
    return null;

  if (!isAuthenticated)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column", gap: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600, textAlign: "center" }}>TRM Open AI Service using GPT-4</h1>
        <Button $primary type="button" onClick={login}>
          Login with Google
        </Button>
      </div>
    );

  return <>{children}</>;
};
