import { useContext } from "react";
import type { FontSizeContextValue } from "contexts/FontSizeContext";
import { FontSizeContext } from "contexts/FontSizeContext";

export function useFontSize(): FontSizeContextValue {
  const ctx = useContext(FontSizeContext);

  if (ctx === null)
    throw new Error("useFontSize must be used within FontSizeProvider");

  return ctx;
}
