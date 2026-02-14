import {
  MEMORY_STORAGE_KEY,
  FONT_SIZE_STORAGE_KEY,
  FONT_SIZE_MIN,
  FONT_SIZE_MAX,
  FONT_SIZE_DEFAULT,
} from "consts";

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
