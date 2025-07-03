export interface Priority {
  id: number;
  name: string;
  key: string;
  description: string;
  color: string;
  order: number;
  active: boolean;
}

export interface Category {
  id: number;
  name: string;
  key: string;
  description: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export type TabKey = 'cliente' | 'gestao' | 'dev' | 'config';
