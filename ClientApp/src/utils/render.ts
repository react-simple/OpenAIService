import React from "react";

/**
 * Applies inline formatting (**bold**, __italic__) to a string and returns React nodes.
 * Uses keyPrefix so keys stay unique when used for multiple segments (e.g. per line).
 */
function formatInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const re = /\*\*(.+?)\*\*|__(.+?)__/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      parts.push(text.slice(lastIndex, m.index));
    }

    if (m[1] !== undefined) {
      parts.push(React.createElement("strong", { key: `${keyPrefix}-${parts.length}` }, m[1]));
    }
    else if (m[2] !== undefined) {
      parts.push(React.createElement("em", { key: `${keyPrefix}-${parts.length}` }, m[2]));
    }

    lastIndex = re.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Parses message text and returns React nodes with formatting:
 * - **text** → bold
 * - __text__ → italic
 * - --- (line of three or more dashes) → horizontal rule
 * - ### text (at line start) → h3 heading
 */
export function formatMessageContent(text: string): React.ReactNode {
  const lines = text.split("\n");
  const parts: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const keyPrefix = `L${i}`;

    if (/^---+$/.test(line.trim())) {
      parts.push(React.createElement("hr", { key: `${keyPrefix}-hr` }));
    }
    else {
      const h3Match = /^###\s*(.*)$/.exec(line);

      if (h3Match !== null) {
        parts.push(
          React.createElement("h3", { key: `${keyPrefix}-h3`, style: { margin: 0 } }, ...formatInline(h3Match[1], `${keyPrefix}-h3`))
        );
      }
      else {
        parts.push(...formatInline(line, keyPrefix));
      }
    }

    if (i < lines.length - 1) {
      parts.push(React.createElement("br", { key: `${keyPrefix}-br` }));
    }
  }

  return parts.length > 0 ? parts : text;
}
