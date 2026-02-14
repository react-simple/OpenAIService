import styled from "styled-components";

export const PinInputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
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
`;
