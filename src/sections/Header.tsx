import { useState, useRef, useEffect } from 'react';
import { Search, Bell, X, Check } from 'lucide-react';
import type { Alert, User } from '@/types';
import { cn } from '@/lib/utils';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchFocus: () => void;
  alerts: Alert[];
  onMarkAlertRead: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  currentUser: User;
}

export function Header({
  onSearchFocus,
  alerts,
  onMarkAlertRead,
  onDeleteAlert,
  currentUser,
}: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = alerts.filter((a) => !a.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'birth':
        return 'bg-blue-500';
      case 'vaccine':
        return 'bg-green-500';
      case 'inventory':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onSearchFocus}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
        >
          <Search size={16} />
          <span>Buscar animales, registros, inventario...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-white border border-gray-200 rounded">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold">Notificaciones</h3>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {alerts.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-gray-400 text-center">
                    No hay notificaciones
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        'flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors',
                        !alert.read && 'bg-blue-50/30'
                      )}
                    >
                      <span
                        className={cn(
                          'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                          getAlertColor(alert.type)
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-medium', !alert.read && 'text-blue-700')}>
                          {alert.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                          {alert.description}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">{alert.date}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!alert.read && (
                          <button
                            onClick={() => onMarkAlertRead(alert.id)}
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                            title="Marcar como leida"
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          title="Eliminar"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
          <div className="w-7 h-7 rounded-full bg-gray-800 text-white text-xs font-medium flex items-center justify-center">
            {currentUser.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-gray-700">{currentUser.name}</p>
            <p className="text-[10px] text-gray-400 capitalize">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
