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
  /** When true (default), assistant messages are sent to OpenAI; when false, only user and system messages are sent. */
  includeResponses?: boolean;
  /** When true (default), system (memory) message is sent to OpenAI; when false, it is omitted. */
  includeMemory?: boolean;
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
