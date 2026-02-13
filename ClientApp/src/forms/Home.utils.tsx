import React from "react";

export const MEMORY_STORAGE_KEY = "openai-chat-memory";
export const FONT_SIZE_STORAGE_KEY = "openai-chat-font-size";
export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 24;
export const FONT_SIZE_DEFAULT = 16;

export function getStoredMemory(): string {
  try {
    return localStorage.getItem(MEMORY_STORAGE_KEY) ?? "";
  }
  catch {
    return "";
  }
}

export function getStoredFontSize(): number {
  try {
    const n = parseInt(localStorage.getItem(FONT_SIZE_STORAGE_KEY) ?? "", 10);
    if (!Number.isNaN(n) && n >= FONT_SIZE_MIN && n <= FONT_SIZE_MAX) return n;
  }
  catch {
    // ignore
  }
  return FONT_SIZE_DEFAULT;
}

export function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
