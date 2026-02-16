export interface SendOptions {
  includeResponses: boolean;
  includeMemory: boolean;
}

export interface WordCounts {
  lastSent: number;
  lastReceived: number;
  totalSent: number;
  totalReceived: number;
}
