export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  role: 'admin' | 'manager' | 'support';
  avatar: string;
  active: boolean;
  createdAt: Date;
  lastLogin: Date | null;
}
