import styled from "styled-components";

export const PinInputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;

  @media (max-width: 480px) {
    gap: 0.35rem;
  }
`;

export const PinInput = styled.input`
  width: 3rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #0a7cff;
    box-shadow: 0 0 0 2px rgba(10, 124, 255, 0.2);
  }

  @media (max-width: 480px) {
    width: 1.75rem;
    height: 2.5rem;
    font-size: 1rem;
    letter-spacing: 0.05em;
    border-radius: 6px;
  }
`;
