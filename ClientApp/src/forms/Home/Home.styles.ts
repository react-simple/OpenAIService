import styled from "styled-components";

export const Layout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;

  @media (min-width: 1024px) {
    max-width: 1200px;
  }

  @media (min-width: 1920px) {
    max-width: 1600px;
  }
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

export const MessageActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

export const MessageBubble = styled.div<{ $variant: "user" | "assistant" | "error" }>`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5em;
  background: ${(p) =>
    p.$variant === "user" ? "#0a7cff" : p.$variant === "error" ? "#fef2f2" : "#e5e7eb"};
  color: ${(p) => (p.$variant === "user" ? "white" : p.$variant === "error" ? "#dc2626" : "#111")};
  border: ${(p) => (p.$variant === "error" ? "1px solid #fecaca" : "none")};
`;

export const LoadingSpinner = styled.div`
  align-self: flex-start;
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #0a7cff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
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

  @media (max-width: 480px) {
    min-height: 88px;
  }

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

export const ErrorText = styled.span`
  color: #dc2626;
  font-size: 0.9rem;
`;

export const SentReceivedLabel = styled.span`
  font-size: 0.9rem;
  color: #6b7280;
  margin-right: auto;
`;

export const OptionsWrap = styled.div`
  position: relative;
  display: inline-flex;
`;

export const OptionsTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
  &:focus {
    outline: none;
    border-color: #0a7cff;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const OptionsPopup = styled.div`
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 4px;
  padding: 0.5rem 0.25rem;
  min-width: 160px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #374151;
  cursor: pointer;
  user-select: none;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;

  &:hover {
    background: #f3f4f6;
  }

  input {
    flex-shrink: 0;
  }
`;
