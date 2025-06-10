import React, { useState } from 'react';
import { Client, Reminder } from '../../types';
import { Users, Calendar, Clock, AlertCircle, CheckCircle2, ArrowUpDown } from 'lucide-react';

interface DashboardProps {
  clients: Client[];
  reminders: Reminder[];
  onToggleReminderComplete: (reminderId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ clients, reminders, onToggleReminderComplete }) => {
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');

  const upcomingReminders = reminders
    .filter(reminder => !reminder.completed && new Date(`${reminder.date}T${reminder.time}`) >= new Date())
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 5);

  const allActiveReminders = reminders
    .filter(reminder => !reminder.completed)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = getClientPriority(a.clientId);
        const bPriority = getClientPriority(b.clientId);
        const aOrder = priorityOrder[aPriority as keyof typeof priorityOrder] || 2;
        const bOrder = priorityOrder[bPriority as keyof typeof priorityOrder] || 2;
        if (aOrder !== bOrder) return bOrder - aOrder; // High priority first
        // If same priority, sort by date
        return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
      } else {
        return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
      }
    });

  const priorityStats = {
    high: clients.filter(c => c.priority === 'high').length,
    medium: clients.filter(c => c.priority === 'medium').length,
    low: clients.filter(c => c.priority === 'low').length,
  };

  const getClientName = (clientId?: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.fullName || 'No client assigned';
  };

  const getClientPriority = (clientId?: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.priority || 'medium';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString();
  };

  const isOverdue = (date: string, time: string) => {
    return new Date(`${date}T${time}`) < new Date();
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">Overview of your clients and reminders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Reminders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{allActiveReminders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingReminders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">High Priority</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{priorityStats.high}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Reminders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Reminders</h2>
          </div>
          <div className="p-6">
            {upcomingReminders.length > 0 ? (
              <div className="space-y-4">
                {upcomingReminders.map((reminder) => {
                  const priority = getClientPriority(reminder.clientId);
                  return (
                    <div key={reminder.id} className={`flex items-start p-4 rounded-lg border ${getPriorityColor(priority)}`}>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">{reminder.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{getClientName(reminder.clientId)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(reminder.date, reminder.time)}</p>
                        {reminder.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{reminder.notes}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No upcoming reminders</p>
            )}
          </div>
        </div>

        {/* All Reminders with Sorting */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Active Reminders</h2>
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="date">Sort by Date</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>
            </div>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {allActiveReminders.length > 0 ? (
              <div className="space-y-3">
                {allActiveReminders.map((reminder) => {
                  const priority = getClientPriority(reminder.clientId);
                  const overdue = isOverdue(reminder.date, reminder.time);
                  return (
                    <div key={reminder.id} className={`flex items-center p-3 rounded-lg border ${getPriorityColor(priority)} ${overdue ? 'ring-2 ring-red-500 dark:ring-red-400' : ''}`}>
                      <button
                        onClick={() => onToggleReminderComplete(reminder.id)}
                        className="mr-3 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <CheckCircle2 className="h-5 w-5 text-gray-400 hover:text-green-600 dark:hover:text-green-400" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{reminder.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{getClientName(reminder.clientId)}</p>
                        <p className={`text-sm ${overdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                          {formatDateTime(reminder.date, reminder.time)}
                          {overdue && ' (Overdue)'}
                        </p>
                      </div>
                      <div className="ml-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No active reminders</p>
            )}
          </div>
        </div>
      </div>

      {/* Client Priority Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Client Priority Distribution</h2>
        </div>
        <div className="p-6 grid grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span className="text-gray-700 dark:text-gray-300">High Priority</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{priorityStats.high}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
              <span className="text-gray-700 dark:text-gray-300">Medium Priority</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">{priorityStats.medium}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 dark:text-gray-300">Low Priority</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">{priorityStats.low}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};