import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useStore } from '@/hooks/useStore';
import { Search, PawPrint, Stethoscope, Package, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  store: ReturnType<typeof useStore>;
  onClose: () => void;
}

// ─── Constantes de validación ─────────────────────────────────────────────────
const MAX_QUERY_LENGTH = 100;
const MIN_QUERY_LENGTH = 1;
const DEBOUNCE_MS = 200;
// Caracteres permitidos: letras (incluye acentos/ñ), números, espacios, guiones, puntos
const ALLOWED_QUERY_REGEX = /^[\p{L}\p{N}\s\-_.]+$/u;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Elimina caracteres no permitidos y recorta espacios iniciales */
function sanitizeQuery(raw: string): string {
  // Permitir espacio mientras se escribe, pero no al inicio
  const trimmedStart = raw.replace(/^\s+/, '');
  // Eliminar caracteres peligrosos (HTML/scripts)
  return trimmedStart.replace(/[<>'"`;]/g, '');
}

/** Devuelve true si el query tiene contenido útil para buscar */
function isQuerySearchable(q: string): boolean {
  return q.trim().length >= MIN_QUERY_LENGTH;
}

function isValidResult(result: unknown): result is { id: string; type: string; module: string; title: string } {
  if (!result || typeof result !== 'object') return false;
  const r = result as Record<string, unknown>;
  return (
    typeof r.id === 'string' && r.id.length > 0 &&
    typeof r.type === 'string' &&
    typeof r.module === 'string' &&
    typeof r.title === 'string'
  );
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function CommandPalette({ store, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState(() => sanitizeQuery(store.searchQuery ?? ''));
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [queryWarning, setQueryWarning] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincroniza query externo al montar
  useEffect(() => {
    const sanitized = sanitizeQuery(store.searchQuery ?? '');
    setQuery(sanitized);
  }, [store.searchQuery]);

  // Debounce: evita llamar globalSearch en cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Propaga al store solo el query debounced y válido
  useEffect(() => {
    if (isQuerySearchable(debouncedQuery)) {
      store.setSearchQuery(debouncedQuery.trim());
    } else {
      store.setSearchQuery('');
    }
  }, [debouncedQuery, store]);

  // Resultados con guard de validez
  const results = useMemo(() => {
    if (!isQuerySearchable(debouncedQuery)) return [];
    try {
      const raw = store.globalSearch();
      if (!Array.isArray(raw)) return [];
      return raw.filter(isValidResult);
    } catch {
      return [];
    }
  }, [debouncedQuery, store]);

  // Resetear selección cuando cambian resultados
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Manejo de cambio de input con validaciones
  const handleQueryChange = useCallback((raw: string) => {
    // Límite de longitud
    if (raw.length > MAX_QUERY_LENGTH) {
      setQueryWarning(`Máximo ${MAX_QUERY_LENGTH} caracteres`);
      return; // No actualizar si supera el límite
    }

    const sanitized = sanitizeQuery(raw);

    // Avisar si se intentaron caracteres no permitidos
    if (sanitized !== raw && raw.trim().length > 0) {
      setQueryWarning('Algunos caracteres no están permitidos en la búsqueda');
    } else {
      setQueryWarning('');
    }

    // Validar caracteres si hay contenido real
    if (sanitized.trim().length > 0 && !ALLOWED_QUERY_REGEX.test(sanitized)) {
      setQueryWarning('La búsqueda contiene caracteres inválidos');
    }

    setQuery(sanitized);
  }, []);

  // Navegar a un resultado con validaciones
  const handleNavigate = useCallback((result: (typeof results)[0]) => {
    if (!isValidResult(result)) return;
    try {
      store.navigateTo(result.module);
      if (result.type === 'animal') {
        store.openAnimalDetail(result.id);
      }
      onClose();
    } catch {
      // Si la navegación falla, solo cerramos sin crashear
      onClose();
    }
  }, [store, onClose]);

  // Teclado
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (results.length > 0 ? Math.min(prev + 1, results.length - 1) : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter': {
          const selected = results[selectedIndex];
          if (selected) handleNavigate(selected);
          break;
        }
        default:
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, handleNavigate, onClose]);

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

  const showResults = isQuerySearchable(debouncedQuery);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">

        {/* Search Input */}
        <div className={cn(
          'flex items-center gap-3 px-4 py-3 border-b transition-colors',
          queryWarning ? 'border-amber-300 bg-amber-50/30' : 'border-gray-100'
        )}>
          <Search size={18} className={cn('flex-shrink-0', queryWarning ? 'text-amber-400' : 'text-gray-400')} />
          <input
            ref={inputRef}
            autoFocus
            type="text"
            placeholder="Buscar animales, registros médicos, inventario..."
            value={query}
            maxLength={MAX_QUERY_LENGTH}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="flex-1 text-sm outline-none placeholder:text-gray-400 bg-transparent"
            aria-label="Búsqueda global"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {/* Contador de caracteres cuando se acerca al límite */}
          {query.length > MAX_QUERY_LENGTH * 0.8 && (
            <span className={cn(
              'text-[10px] flex-shrink-0 tabular-nums',
              query.length >= MAX_QUERY_LENGTH ? 'text-red-400' : 'text-gray-400'
            )}>
              {query.length}/{MAX_QUERY_LENGTH}
            </span>
          )}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 border border-gray-200 rounded flex-shrink-0">
            ESC
          </kbd>
        </div>

        {/* Advertencia de validación */}
        {queryWarning && (
          <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-100">
            <p className="text-[11px] text-amber-600">{queryWarning}</p>
          </div>
        )}

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {!showResults ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">Escribe para buscar en todo el sistema</p>
              <div className="flex gap-2 justify-center mt-3">
                {['Animales', 'Salud', 'Inventario', 'Finanzas'].map((label) => (
                  <span key={label} className="text-[10px] px-2 py-1 bg-gray-100 rounded text-gray-500">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-400">
                No se encontraron resultados para &quot;{debouncedQuery.trim()}&quot;
              </p>
            </div>
          ) : (
            <div className="py-2">
              <p className="px-4 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleNavigate(result)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                  )}
                  aria-selected={index === selectedIndex}
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
            <kbd className="px-1 py-0.5 bg-white border rounded font-mono">↑↓</kbd> navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border rounded font-mono">Enter</kbd> abrir
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border rounded font-mono">Esc</kbd> cerrar
          </span>
        </div>
      </div>
    </div>
  );
}
