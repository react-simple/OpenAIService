import styled from "styled-components";

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
`;

export const MessageList = styled.div<{ $fontSizePx: number }>`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: ${(p) => p.$fontSizePx}px;
`;

export const MessageBlock = styled.div<{ $align: "start" | "end" }>`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  align-self: ${(p) => (p.$align === "end" ? "flex-end" : "flex-start")};
  gap: 0.35rem;
  max-width: 85%;
  width: fit-content;
`;

export const MessageBubble = styled.div<{ $variant: "user" | "assistant" | "error" }>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  background: ${(p) =>
    p.$variant === "user" ? "#0a7cff" : p.$variant === "error" ? "#fef2f2" : "#e5e7eb"};
  color: ${(p) => (p.$variant === "user" ? "white" : p.$variant === "error" ? "#dc2626" : "#111")};
  border: ${(p) => (p.$variant === "error" ? "1px solid #fecaca" : "none")};
`;

export const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 4px;
  flex-shrink: 0;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const InputArea = styled.div`
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #fff;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 160px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0a7cff;
  }
  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`;

export const SendRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

export const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  border: 1px solid #d1d5db;
  background: ${(p) => (p.$primary ? "#0a7cff" : "#fff")};
  color: ${(p) => (p.$primary ? "white" : "#374151")};

  &:hover:not(:disabled) {
    background: ${(p) => (p.$primary ? "#0660cc" : "#f9fafb")};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ErrorText = styled.span`
  color: #dc2626;
  font-size: 0.9rem;
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const Modal = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 720px;
  width: 95%;
  max-height: 85vh;
  height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

export const ModalHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

export const ModalBody = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

export const MemoryTextArea = styled.textarea`
  width: 100%;
  flex: 1;
  min-height: 320px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  color: #374151;

  &:focus {
    outline: none;
    border-color: #0a7cff;
  }
`;

export const ModalFooter = styled.div`
  padding: 1rem 1.25rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

export const SentReceivedLabel = styled.span`
  font-size: 0.9rem;
  color: #6b7280;
  margin-right: auto;
`;
