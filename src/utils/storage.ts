import { User, Client, Reminder, AppState } from '../types';

const STORAGE_KEY = 'clientManagementApp';

export const getStorageData = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    const parsedData = JSON.parse(data);
    // Ensure reminders have completed property
    if (parsedData.reminders) {
      parsedData.reminders = parsedData.reminders.map((reminder: any) => ({
        ...reminder,
        completed: reminder.completed || false
      }));
    }
    return parsedData;
  }
  return {
    currentUser: null,
    clients: [],
    reminders: []
  };
};

export const setStorageData = (data: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getUsers = (): User[] => {
  const users = localStorage.getItem('users');
  if (users) {
    const parsedUsers = JSON.parse(users);
    // Migrate old users without firstName/lastName
    return parsedUsers.map((user: any) => ({
      ...user,
      firstName: user.firstName || 'Admin',
      lastName: user.lastName || 'User'
    }));
  }
  // Create default admin user
  const defaultUsers: User[] = [
    {
      id: '1',
      username: 'admin',
      password: 'admin123', // In production, this would be hashed
      firstName: 'Admin',
      lastName: 'User'
    }
  ];
  localStorage.setItem('users', JSON.stringify(defaultUsers));
  return defaultUsers;
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('users', JSON.stringify(users));
};