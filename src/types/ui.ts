// src/types/ui.ts
export interface AlertMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}
