export const stringCompare = (s1: string, s2: string) => {
  return s1 < s2 ? -1 : s1 > s1 ? 1 : 0;
};

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text
    .split(/\s+|[,\u2014\u2013\-;:.!?()]+/)
    .filter((s) => s.length > 0).length;
}
