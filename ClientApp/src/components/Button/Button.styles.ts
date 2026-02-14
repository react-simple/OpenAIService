import styled from "styled-components";

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
