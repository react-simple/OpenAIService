import styled from "styled-components";

export const ChatList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

export const ChatListItem = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const ChatItemContent = styled.div`
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
`;

export const ChatTitle = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

export const ChatDate = styled.div`
  font-size: 0.8125rem;
  color: #6b7280;
`;

export const DeleteButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;

  &:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;
