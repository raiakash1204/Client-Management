import React, { useState, useEffect } from 'react';
import { Client, Reminder } from '../../types';
import { ChevronLeft, ChevronRight, Plus, Edit, Trash2, Clock, User, Download } from 'lucide-react';

interface CalendarProps {
  clients: Client[];
  reminders: Reminder[];
  onAddReminder: (date: string) => void;
  onEditReminder: (reminder: Reminder) => void;
  onDeleteReminder: (reminderId: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  clients,
  reminders,
  onAddReminder,
  onEditReminder,
  onDeleteReminder,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Desktop notification functionality
  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format

      reminders.forEach(reminder => {
        if (!reminder.completed && reminder.date === currentDateStr && reminder.time === currentTime) {
          const client = clients.find(c => c.id === reminder.clientId);
          const clientName = client?.fullName || 'No client assigned';
          
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Reminder: ${reminder.title}`, {
              body: `Client: ${clientName}\nTime: ${reminder.time}\n${reminder.notes || ''}`,
              icon: '/favicon.ico',
              tag: reminder.id,
            });
          }
        }
      });
    };

    // Check every minute
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders, clients]);

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentYear, currentMonth + direction, 1);
    setCurrentDate(newDate);
  };

  const formatDate = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getRemindersForDate = (date: string) => {
    return reminders.filter(reminder => !reminder.completed && reminder.date === date);
  };

  const getClientName = (clientId?: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.fullName || 'No client';
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

  const exportToICalendar = () => {
    const activeReminders = reminders.filter(reminder => !reminder.completed);
    
    let icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Client Management App//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    activeReminders.forEach(reminder => {
      const client = clients.find(c => c.id === reminder.clientId);
      const clientName = client?.fullName || 'No client assigned';
      
      // Convert date and time to UTC format
      const startDateTime = new Date(`${reminder.date}T${reminder.time}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
      
      const formatDateForICal = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${reminder.id}@clientmanagement.app`,
        `DTSTART:${formatDateForICal(startDateTime)}`,
        `DTEND:${formatDateForICal(endDateTime)}`,
        `SUMMARY:${reminder.title}`,
        `DESCRIPTION:Client: ${clientName}${reminder.notes ? '\\n\\nNotes: ' + reminder.notes : ''}`,
        `LOCATION:${client?.address || ''}`,
        `CREATED:${formatDateForICal(new Date(reminder.createdAt))}`,
        `LAST-MODIFIED:${formatDateForICal(new Date(reminder.updatedAt))}`,
        'END:VEVENT'
      );
    });

    icalContent.push('END:VCALENDAR');

    const blob = new Blob([icalContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'client-reminders.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-700"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = formatDate(day);
      const dayReminders = getRemindersForDate(date);
      const isToday = today.toDateString() === new Date(currentYear, currentMonth, day).toDateString();
      const isSelected = selectedDate === date;
      
      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' : ''
          } ${isSelected ? 'bg-blue-100 dark:bg-blue-800/50 border-blue-500 dark:border-blue-400' : ''}`}
          onClick={() => setSelectedDate(selectedDate === date ? null : date)}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
              {day}
            </span>
            {dayReminders.length > 0 && (
              <span className="bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {dayReminders.length}
              </span>
            )}
          </div>
          <div className="mt-1 space-y-1">
            {dayReminders.slice(0, 2).map((reminder) => {
              const priority = getClientPriority(reminder.clientId);
              return (
                <div
                  key={reminder.id}
                  className={`text-xs p-1 rounded truncate border ${getPriorityColor(priority)}`}
                  title={`${reminder.title} - ${getClientName(reminder.clientId)}`}
                >
                  {reminder.title}
                </div>
              );
            })}
            {dayReminders.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{dayReminders.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const selectedDateReminders = selectedDate ? getRemindersForDate(selectedDate) : [];

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your reminders and appointments</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={exportToICalendar}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Calendar
          </button>
          {selectedDate && (
            <button
              onClick={() => onAddReminder(selectedDate)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Reminder
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-7 gap-0 mb-4">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        {/* Reminders for Selected Date */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedDate ? `Reminders for ${selectedDate}` : 'Select a date'}
            </h3>
          </div>
          
          <div className="p-6">
            {selectedDate ? (
              selectedDateReminders.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateReminders.map((reminder) => {
                    const priority = getClientPriority(reminder.clientId);
                    return (
                      <div key={reminder.id} className={`p-4 rounded-lg border ${getPriorityColor(priority)}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{reminder.title}</h4>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => onEditReminder(reminder)}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteReminder(reminder.id)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {reminder.time}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {getClientName(reminder.clientId)}
                          </div>
                          {reminder.notes && (
                            <p className="mt-2 text-gray-600 dark:text-gray-300">{reminder.notes}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No reminders for this date</p>
                  <button
                    onClick={() => onAddReminder(selectedDate)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Add Reminder
                  </button>
                </div>
              )
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Click on a date to view or add reminders
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};