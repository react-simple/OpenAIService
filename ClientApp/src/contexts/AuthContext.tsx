import React, { createContext, useCallback, useContext, useState } from "react";
import { validatePin as validatePinApi } from "functions";

interface AuthContextValue {
  pin: string | null;
  isAuthenticated: boolean;
  validatePin: (pin: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [pin, setPin] = useState<string | null>(null);

  const validatePin = useCallback(async (enteredPin: string) => {
    await validatePinApi(enteredPin);
    setPin(enteredPin);
  }, []);

  const value: AuthContextValue = {
    pin,
    isAuthenticated: pin !== null,
    validatePin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx)
    throw new Error("useAuth must be used within AuthProvider");

  return ctx;
}
