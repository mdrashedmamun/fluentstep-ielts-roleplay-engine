
export enum AppView {
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  ROLEPLAY_DISPLAY = 'ROLEPLAY_DISPLAY'
}

export interface RoleplayData {
  content: string;
  answers: string;
}

export interface HistoryItem {
  topic: string;
  timestamp: number;
}
