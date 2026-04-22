import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { Search, PawPrint, Stethoscope, Package, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  store: ReturnType<typeof useStore>;
  onClose: () => void;
}

export function CommandPalette({ store, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState(store.searchQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setQuery(store.searchQuery);
  }, [store.searchQuery]);

  useEffect(() => {
    store.setSearchQuery(query);
  }, [query, store]);

  const results = useMemo(() => store.globalSearch(), [store]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        const result = results[selectedIndex];
        store.navigateTo(result.module);
        if (result.type === 'animal') {
          store.openAnimalDetail(result.id);
        }
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, store, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'animal':
        return <PawPrint size={16} className="text-blue-500" />;
      case 'medical':
        return <Stethoscope size={16} className="text-green-500" />;
      case 'inventory':
        return <Package size={16} className="text-amber-500" />;
      case 'transaction':
        return <DollarSign size={16} className="text-emerald-500" />;
      default:
        return <Search size={16} className="text-gray-400" />;
    }
  };

  const handleResultClick = (result: (typeof results)[0]) => {
    store.navigateTo(result.module);
    if (result.type === 'animal') {
      store.openAnimalDetail(result.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Buscar animales, registros medicos, inventario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 border border-gray-200 rounded flex-shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!query.trim() ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">Escribe para buscar en todo el sistema</p>
              <div className="flex gap-2 justify-center mt-3">
                <span className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-500">
                  Animales
                </span>
                <span className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-500">
                  Salud
                </span>
                <span className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-500">
                  Inventario
                </span>
                <span className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-500">
                  Finanzas
                </span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">No se encontraron resultados para &quot;{query}&quot;</p>
            </div>
          ) : (
            <div className="py-2">
              <p className="px-4 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                >
                  {getIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{result.title}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{result.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border rounded font-mono">Enter</kbd> para abrir
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border rounded font-mono">Esc</kbd> para cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
