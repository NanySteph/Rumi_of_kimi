import type { ModuleType, Alert } from '@/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PawPrint,
  GitBranch,
  Baby,
  Stethoscope,
  TrendingUp,
  Package,
  DollarSign,
  Settings,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  currentModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
  alerts: Alert[];
}

const navGroups = [
  {
    label: '',
    items: [{ id: 'dashboard' as ModuleType, label: 'Dashboard', icon: <LayoutDashboard size={18} /> }],
  },
  {
    label: 'Nucleo',
    items: [
      { id: 'animals' as ModuleType, label: 'Animales', icon: <PawPrint size={18} /> },
      { id: 'genealogy' as ModuleType, label: 'Genealogia', icon: <GitBranch size={18} /> },
    ],
  },
  {
    label: 'Operaciones',
    items: [
      { id: 'reproduction' as ModuleType, label: 'Reproduccion', icon: <Baby size={18} /> },
      { id: 'health' as ModuleType, label: 'Salud', icon: <Stethoscope size={18} /> },
      { id: 'production' as ModuleType, label: 'Produccion', icon: <TrendingUp size={18} /> },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { id: 'inventory' as ModuleType, label: 'Inventario', icon: <Package size={18} /> },
      { id: 'finance' as ModuleType, label: 'Finanzas', icon: <DollarSign size={18} /> },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'settings' as ModuleType, label: 'Ajustes', icon: <Settings size={18} /> },
    ],
  },
];

export function Sidebar({ currentModule, onNavigate, alerts }: SidebarProps) {
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <aside className="sidebar-dark w-64 flex-shrink-0 flex flex-col h-full overflow-y-auto sidebar-scroll">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <PawPrint size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-white font-semibold text-sm tracking-wide">Sistema Ganadero</h1>
          <p className="text-[#8a8f98] text-[10px] uppercase tracking-wider">Management Pro</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {navGroups.map((group, gi) => (
          <div key={gi} className="mb-4">
            {group.label && (
              <p className="px-4 mb-1 text-[10px] font-medium text-[#8a8f98] uppercase tracking-wider">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 text-sm transition-all duration-200 sidebar-hover',
                    isActive && 'sidebar-active'
                  )}
                >
                  <span className={cn('flex-shrink-0', isActive ? 'text-white' : 'text-[#8a8f98]')}>
                    {item.icon}
                  </span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="text-white/50" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Alerts Badge */}
      {unreadCount > 0 && (
        <div className="px-4 py-3 border-t border-white/10">
          <button
            onClick={() => onNavigate('health')}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {unreadCount} alerta{unreadCount !== 1 ? 's' : ''} pendiente{unreadCount !== 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#8a8f98] sidebar-hover rounded-md">
          <HelpCircle size={18} />
          <span>Ayuda</span>
        </button>
      </div>
    </aside>
  );
}
