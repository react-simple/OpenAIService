import styled from "styled-components";

export const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
`;

export const ToolbarSpacer = styled.div`
  flex: 1;
`;

export const UserEmail = styled.span`
  font-size: 0.9rem;
  color: #6b7280;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
