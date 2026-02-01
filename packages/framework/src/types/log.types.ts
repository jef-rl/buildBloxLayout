// Logging types

export interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: number;
  source?: string;
  data?: any;
}

export type LogState = {
  entries: LogEntry[];
  maxEntries: number;
}