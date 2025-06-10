import { User } from '../types';
import { getUsers, saveUser } from './storage';

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
};

export const createUser = (username: string, password: string, firstName: string, lastName: string): { success: boolean; error?: string } => {
  const users = getUsers();
  
  // Check if username already exists
  if (users.find(u => u.username === username)) {
    return { success: false, error: 'Username already exists' };
  }

  // Create new user
  const newUser: User = {
    id: generateId(),
    username,
    password, // In production, this would be hashed
    firstName,
    lastName
  };

  saveUser(newUser);
  return { success: true };
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};