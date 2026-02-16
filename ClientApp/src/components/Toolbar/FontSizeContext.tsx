import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  FONT_SIZE_STORAGE_KEY,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_DEFAULT,
} from "consts";
import { getStoredFontSize } from "forms/Home/Home.utils";

interface FontSizeContextValue {
  fontSize: number;
  decreaseFontSize: () => void;
  increaseFontSize: () => void;
  resetFontSize: () => void;
}

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState(() => getStoredFontSize());

  useEffect(() => {
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, String(fontSize));
    }
    catch {
      // ignore
    }
  }, [fontSize]);

  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.max(FONT_SIZE_MIN, prev - 1));
  }, []);

  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.min(FONT_SIZE_MAX, prev + 1));
  }, []);

  const resetFontSize = useCallback(() => {
    setFontSize(FONT_SIZE_DEFAULT);
  }, []);

  const value: FontSizeContextValue = {
    fontSize,
    decreaseFontSize,
    increaseFontSize,
    resetFontSize,
  };

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize(): FontSizeContextValue {
  const ctx = useContext(FontSizeContext);

  if (ctx === null)
    throw new Error("useFontSize must be used within FontSizeProvider");

  return ctx;
}
