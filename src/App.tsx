import React, { useState, useEffect } from 'react';
import { User, Client, Reminder, AppState } from './types';
import { getStorageData, setStorageData } from './utils/storage';
import { authenticateUser, createUser, generateId } from './utils/auth';
import { Login } from './components/Auth/Login';
import { Layout } from './components/Layout/Layout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ClientList } from './components/Clients/ClientList';
import { ClientForm } from './components/Clients/ClientForm';
import { Calendar } from './components/Calendar/Calendar';
import { ReminderForm } from './components/Reminders/ReminderForm';

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    clients: [],
    reminders: []
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginError, setLoginError] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [reminderInitialDate, setReminderInitialDate] = useState<string>('');
  const [reminderClientId, setReminderClientId] = useState<string>('');

  useEffect(() => {
    const data = getStorageData();
    setAppState(data);
  }, []);

  const saveAppState = (newState: AppState) => {
    setAppState(newState);
    setStorageData(newState);
  };

  const handleLogin = (username: string, password: string) => {
    const user = authenticateUser(username, password);
    if (user) {
      const newState = { ...appState, currentUser: user };
      saveAppState(newState);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const handleSignup = (username: string, password: string, firstName: string, lastName: string) => {
    const result = createUser(username, password, firstName, lastName);
    if (result.success) {
      const user = authenticateUser(username, password);
      if (user) {
        const newState = { ...appState, currentUser: user };
        saveAppState(newState);
        setLoginError('');
      }
    } else {
      setLoginError(result.error || 'Failed to create account');
    }
  };

  const handleLogout = () => {
    const newState = { ...appState, currentUser: null };
    saveAppState(newState);
    setActiveTab('dashboard');
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowClientForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingClient) {
      // Update existing client
      const updatedClients = appState.clients.map(client =>
        client.id === editingClient.id
          ? { ...client, ...clientData, updatedAt: now }
          : client
      );
      saveAppState({ ...appState, clients: updatedClients });
    } else {
      // Add new client
      const newClient: Client = {
        ...clientData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
      };
      saveAppState({ ...appState, clients: [...appState.clients, newClient] });
    }
    
    setShowClientForm(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      const updatedClients = appState.clients.filter(client => client.id !== clientId);
      // Also remove reminders associated with this client
      const updatedReminders = appState.reminders.map(reminder =>
        reminder.clientId === clientId
          ? { ...reminder, clientId: undefined }
          : reminder
      );
      saveAppState({ ...appState, clients: updatedClients, reminders: updatedReminders });
    }
  };

  const handleAddReminder = (date?: string) => {
    setEditingReminder(null);
    setReminderInitialDate(date || '');
    setReminderClientId('');
    setShowReminderForm(true);
  };

  const handleAddReminderForClient = (clientId: string) => {
    setEditingReminder(null);
    setReminderInitialDate('');
    setReminderClientId(clientId);
    setShowReminderForm(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setReminderInitialDate('');
    setReminderClientId('');
    setShowReminderForm(true);
  };

  const handleSaveReminder = (reminderData: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    
    if (editingReminder) {
      // Update existing reminder
      const updatedReminders = appState.reminders.map(reminder =>
        reminder.id === editingReminder.id
          ? { ...reminder, ...reminderData, updatedAt: now }
          : reminder
      );
      saveAppState({ ...appState, reminders: updatedReminders });
    } else {
      // Add new reminder
      const newReminder: Reminder = {
        ...reminderData,
        id: generateId(),
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      saveAppState({ ...appState, reminders: [...appState.reminders, newReminder] });
    }
    
    setShowReminderForm(false);
    setEditingReminder(null);
    setReminderInitialDate('');
    setReminderClientId('');
  };

  const handleDeleteReminder = (reminderId: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      const updatedReminders = appState.reminders.filter(reminder => reminder.id !== reminderId);
      saveAppState({ ...appState, reminders: updatedReminders });
    }
  };

  const handleToggleReminderComplete = (reminderId: string) => {
    const updatedReminders = appState.reminders.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, completed: !reminder.completed, updatedAt: new Date().toISOString() }
        : reminder
    );
    saveAppState({ ...appState, reminders: updatedReminders });
  };

  if (!appState.currentUser) {
    return <Login onLogin={handleLogin} onSignup={handleSignup} error={loginError} />;
  }

  if (showClientForm) {
    return (
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
        currentUser={appState.currentUser}
      >
        <ClientForm
          client={editingClient || undefined}
          onSave={handleSaveClient}
          onCancel={() => {
            setShowClientForm(false);
            setEditingClient(null);
          }}
        />
      </Layout>
    );
  }

  if (showReminderForm) {
    return (
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogout={handleLogout}
        currentUser={appState.currentUser}
      >
        <ReminderForm
          reminder={editingReminder || undefined}
          clients={appState.clients}
          initialDate={reminderInitialDate}
          initialClientId={reminderClientId}
          onSave={handleSaveReminder}
          onCancel={() => {
            setShowReminderForm(false);
            setEditingReminder(null);
            setReminderInitialDate('');
            setReminderClientId('');
          }}
        />
      </Layout>
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      onLogout={handleLogout}
      currentUser={appState.currentUser}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          clients={appState.clients} 
          reminders={appState.reminders}
          onToggleReminderComplete={handleToggleReminderComplete}
        />
      )}
      {activeTab === 'clients' && (
        <ClientList
          clients={appState.clients}
          onAddClient={handleAddClient}
          onEditClient={handleEditClient}
          onDeleteClient={handleDeleteClient}
          onAddReminderForClient={handleAddReminderForClient}
        />
      )}
      {activeTab === 'calendar' && (
        <Calendar
          clients={appState.clients}
          reminders={appState.reminders}
          onAddReminder={handleAddReminder}
          onEditReminder={handleEditReminder}
          onDeleteReminder={handleDeleteReminder}
        />
      )}
    </Layout>
  );
}

export default App;