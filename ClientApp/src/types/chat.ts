export type ChatRole = "user" | "system" | "assistant";

export enum DisplayMessageType {
  Normal = "normal",
  Error = "error",
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatDisplayMessage extends ChatMessage {
  displayType: DisplayMessageType;
}

export interface ChatRequest {
  messages: ChatMessage[];
  chatId?: number | null;
}

export interface ChatResponse {
  chatId: number;
  messages: ChatMessage[];
}

export interface ChatListItem {
  chatId: number;
  title: string;
  chatUpdate: string | Date;
}

export interface ChatDto {
  chatId: number;
  title: string;
  chatUpdate: string | Date;
  content: ChatMessage[] | null;
}
