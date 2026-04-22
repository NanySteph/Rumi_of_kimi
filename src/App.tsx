import { useEffect, useCallback, useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Sidebar } from '@/sections/Sidebar';
import { Header } from '@/sections/Header';
import { CommandPalette } from '@/sections/CommandPalette';
import { DetailPanel } from '@/sections/DetailPanel';
import { Dashboard } from '@/sections/Dashboard';
import { Animals } from '@/sections/Animals';
import { Genealogy } from '@/sections/Genealogy';
import { Reproduction } from '@/sections/Reproduction';
import { Health } from '@/sections/Health';
import { Production } from '@/sections/Production';
import { Inventory } from '@/sections/Inventory';
import { Finance } from '@/sections/Finance';
import { Settings } from '@/sections/Settings';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function App() {
  const store = useStore();
  const [toastShown, setToastShown] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        store.setCommandOpen(true);
      }
    },
    [store]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!toastShown) {
      const unreadAlerts = store.alerts.filter((a) => !a.read);
      if (unreadAlerts.length > 0) {
        toast.info(`Tienes ${unreadAlerts.length} alertas pendientes`, {
          description: 'Revisa las notificaciones para mas detalles',
        });
      }
      setToastShown(true);
    }
  }, [store.alerts, toastShown]);

  const renderModule = () => {
    switch (store.currentModule) {
      case 'dashboard':
        return <Dashboard store={store} />;
      case 'animals':
        return <Animals store={store} />;
      case 'genealogy':
        return <Genealogy store={store} />;
      case 'reproduction':
        return <Reproduction store={store} />;
      case 'health':
        return <Health store={store} />;
      case 'production':
        return <Production store={store} />;
      case 'inventory':
        return <Inventory store={store} />;
      case 'finance':
        return <Finance store={store} />;
      case 'settings':
        return <Settings store={store} />;
      default:
        return <Dashboard store={store} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar
        currentModule={store.currentModule}
        onNavigate={store.navigateTo}
        alerts={store.alerts}
      />
      <div className="flex flex-col flex-1 min-w-0">
        <Header
          searchQuery={store.searchQuery}
          setSearchQuery={store.setSearchQuery}
          onSearchFocus={() => store.setCommandOpen(true)}
          alerts={store.alerts}
          onMarkAlertRead={store.markAlertRead}
          onDeleteAlert={store.deleteAlert}
          currentUser={store.users[0]}
        />
        <main className="flex-1 overflow-auto bg-gray-50/50">
          {renderModule()}
        </main>
      </div>

      {store.commandOpen && (
        <CommandPalette
          store={store}
          onClose={() => store.setCommandOpen(false)}
        />
      )}

      {store.detailPanelOpen && store.selectedAnimalId && (
        <DetailPanel
          store={store}
          animalId={store.selectedAnimalId}
          onClose={store.closeDetailPanel}
        />
      )}

      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
