export interface User {
  id: string;
  username: string;
  password: string; // In production, this would be hashed
  firstName: string;
  lastName: string;
}

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  notes?: string;
  clientId?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  currentUser: User | null;
  clients: Client[];
  reminders: Reminder[];
}