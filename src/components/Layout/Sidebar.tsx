import React from 'react';
import { Users, Calendar, Home, LogOut, Moon, Sun, User, Clock } from 'lucide-react';
import { useTheme } from './Layout';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  currentUser: { username: string; firstName: string; lastName: string } | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout, currentUser }) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
  ];

  const getCurrentDateTime = () => {
    const now = new Date();
    return {
      date: now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const [currentDateTime, setCurrentDateTime] = React.useState(getCurrentDateTime());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col border-r border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          Client Manager
        </h1>
      </div>

      {/* Date and Time Display - Fixed Dark Mode */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Clock className="h-4 w-4 mr-2" />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{currentDateTime.time}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{currentDateTime.date}</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {/* Current User Display */}
        {currentUser && (
          <div className="flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <User className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
            <span className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
              {currentUser.firstName} {currentUser.lastName}
            </span>
          </div>
        )}
        
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
        >
          {isDarkMode ? (
            <>
              <Sun className="h-5 w-5 mr-3" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="h-5 w-5 mr-3" />
              Dark Mode
            </>
          )}
        </button>
        
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};