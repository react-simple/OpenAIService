import styled from "styled-components";

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
`;

export const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const MessageBubble = styled.div<{ $variant: "user" | "assistant" | "error" }>`
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  align-self: ${(p) => (p.$variant === "user" ? "flex-end" : "flex-start")};
  background: ${(p) =>
    p.$variant === "user" ? "#0a7cff" : p.$variant === "error" ? "#fef2f2" : "#e5e7eb"};
  color: ${(p) => (p.$variant === "user" ? "white" : p.$variant === "error" ? "#dc2626" : "#111")};
  border: ${(p) => (p.$variant === "error" ? "1px solid #fecaca" : "none")};
`;

export const InputArea = styled.div`
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #fff;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 80px;
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
  max-width: 500px;
  width: 90%;
  max-height: 70vh;
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
`;

export const ModalBody = styled.div`
  padding: 1.25rem;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
  flex: 1;
  color: #374151;
`;
