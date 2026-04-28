import { useMemo } from 'react';
import { useStore } from '@/hooks/useStore';
import { PawPrint, Heart, TrendingUp, DollarSign, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  store: ReturnType<typeof useStore>;
}

// ─── Helpers de validación ────────────────────────────────────────────────────

/** Formatea un monto numérico de forma segura */
function formatAmount(value: unknown): string {
  const num = Number(value);
  if (!isFinite(num) || isNaN(num)) return 'L 0';
  return `L ${Math.abs(num).toLocaleString()}`;
}

/** Formatea una fecha ISO (YYYY-MM-DD) a formato legible; retorna fallback si es inválida */
function formatDate(dateStr: unknown, fallback = '—'): string {
  if (!dateStr || typeof dateStr !== 'string') return fallback;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Verifica que un animal tenga los campos mínimos para renderizarse */
function isValidAnimal(a: unknown): a is {
  id: string; name: string; breed: string; status: string;
  sex: string; reproductiveStatus?: string; estimatedDueDate?: string;
  image: string;
} {
  if (!a || typeof a !== 'object') return false;
  const obj = a as Record<string, unknown>;
  return (
    typeof obj.id === 'string' && obj.id.length > 0 &&
    typeof obj.name === 'string' &&
    typeof obj.breed === 'string' &&
    typeof obj.status === 'string' &&
    typeof obj.sex === 'string'
  );
}

/** Verifica que una transacción tenga los campos mínimos */
function isValidTransaction(t: unknown): t is {
  id: string; date: string; description: string;
  category: string; type: 'income' | 'expense'; amount: number;
} {
  if (!t || typeof t !== 'object') return false;
  const obj = t as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.date === 'string' &&
    typeof obj.description === 'string' &&
    (obj.type === 'income' || obj.type === 'expense') &&
    typeof obj.amount === 'number' && isFinite(obj.amount)
  );
}

/** Verifica que una alerta tenga los campos mínimos */
function isValidAlert(a: unknown): a is {
  id: string; title: string; description: string; read: boolean;
} {
  if (!a || typeof a !== 'object') return false;
  const obj = a as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.read === 'boolean'
  );
}

/** Verifica que un ítem de inventario tenga los campos mínimos */
function isValidInventoryItem(i: unknown): i is { quantity: number; reorderLevel: number } {
  if (!i || typeof i !== 'object') return false;
  const obj = i as Record<string, unknown>;
  return (
    typeof obj.quantity === 'number' && isFinite(obj.quantity) &&
    typeof obj.reorderLevel === 'number' && isFinite(obj.reorderLevel)
  );
}

/** Etiqueta de categoría de transacción con fallback */
function txCategoryLabel(category: unknown): string {
  const map: Record<string, string> = {
    sale: 'Venta',
    veterinary_expense: 'Veterinaria',
    feed_cost: 'Alimento',
  };
  return (typeof category === 'string' && map[category]) ? map[category] : 'Insumos';
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function Dashboard({ store }: DashboardProps) {

  // Arrays saneados — nunca undefined/null
  const animals = useMemo(
    () => (Array.isArray(store.animals) ? store.animals.filter(isValidAnimal) : []),
    [store.animals]
  );

  const transactions = useMemo(
    () => (Array.isArray(store.financialTransactions) ? store.financialTransactions.filter(isValidTransaction) : []),
    [store.financialTransactions]
  );

  const inventory = useMemo(
    () => (Array.isArray(store.inventory) ? store.inventory.filter(isValidInventoryItem) : []),
    [store.inventory]
  );

  const alerts = useMemo(
    () => (Array.isArray(store.alerts) ? store.alerts.filter(isValidAlert) : []),
    [store.alerts]
  );

  // KPI — derivados de datos ya validados
  const totalAnimals   = animals.filter((a) => a.status === 'active').length;
  const femaleCount    = animals.filter((a) => a.status === 'active' && a.sex === 'female').length;
  const pregnantCount  = animals.filter((a) => a.reproductiveStatus === 'pregnant').length;
  const inHeatCount    = animals.filter((a) => a.reproductiveStatus === 'in_heat').length;
  const lowInventory   = inventory.filter((i) => i.quantity <= i.reorderLevel).length;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (isFinite(t.amount) ? t.amount : 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (isFinite(t.amount) ? t.amount : 0), 0);

  const balance = totalIncome - totalExpense;

  // Partos próximos: solo animales con fecha futura o válida
  const upcomingBirths = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return animals
      .filter((a) => {
        if (!a.estimatedDueDate || typeof a.estimatedDueDate !== 'string') return false;
        const d = new Date(a.estimatedDueDate);
        if (isNaN(d.getTime())) return false;
        return a.estimatedDueDate >= today; // solo fechas presentes o futuras
      })
      .sort((a, b) => (a.estimatedDueDate ?? '').localeCompare(b.estimatedDueDate ?? ''));
  }, [animals]);

  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => {
          // Validar que ambas fechas sean válidas antes de comparar
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
          if (isNaN(dateA.getTime())) return 1;
          if (isNaN(dateB.getTime())) return -1;
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5),
    [transactions]
  );

  const recentAlerts = useMemo(
    () => alerts.filter((a) => !a.read).slice(0, 5),
    [alerts]
  );

  const kpiCards = [
    {
      title: 'Total Animales',
      value: totalAnimals.toString(),
      subtitle: `${animals.length} registrados`,
      icon: <PawPrint size={20} className="text-blue-500" />,
      trend: `+${femaleCount} hembras`,
    },
    {
      title: 'Animales Preñadas',
      value: pregnantCount.toString(),
      subtitle: `${inHeatCount} en celo`,
      icon: <Heart size={20} className="text-pink-500" />,
      trend: `${upcomingBirths.length} partos próximos`,
    },
    {
      title: 'Ingresos',
      value: formatAmount(totalIncome),
      subtitle: 'Acumulado',
      icon: <TrendingUp size={20} className="text-emerald-500" />,
      trend: `${formatAmount(totalExpense)} gastos`,
    },
    {
      title: 'Balance',
      value: `${balance < 0 ? '-' : ''}${formatAmount(balance)}`,
      subtitle: 'Neto',
      icon: <DollarSign size={20} className="text-amber-500" />,
      trend: balance > 0 ? 'Positivo' : balance < 0 ? 'Negativo' : 'En cero',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-48 bg-gray-900">
        <img
          src="/images/farm-hero.jpg"
          alt="Vista de la finca"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="relative z-10 p-6 h-full flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-white mb-1">Bienvenido a Sistema Ganadero</h1>
          <p className="text-white/80 text-sm max-w-lg">
            Gestiona tu ganado, controla la reproducción, monitorea la salud y optimiza tus operaciones desde un solo lugar.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card, index) => (
          <Card
            key={card.title}
            className={`kpi-card-gradient border border-gray-200 animate-slide-up stagger-${index + 1}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{card.subtitle}</p>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                  {card.icon}
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100">
                <p className="text-[11px] text-gray-500">{card.trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming Births */}
        <Card className="border border-gray-200 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Calendar size={16} className="text-pink-500" />
              Partos Próximos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBirths.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No hay partos programados</p>
            ) : (
              <div className="space-y-3">
                {upcomingBirths.map((animal) => (
                  <div
                    key={animal.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => store.openAnimalDetail(animal.id)}
                  >
                    <img
                      src={animal.image}
                      alt={animal.name || 'Animal'}
                      className="w-10 h-10 rounded-full object-cover bg-gray-100"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{animal.name || '—'}</p>
                      <p className="text-xs text-gray-500">
                        {animal.id} - {animal.breed || 'Sin raza'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 text-[10px]">
                        Preñada
                      </Badge>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {formatDate(animal.estimatedDueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Alertas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No hay alertas pendientes</p>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-2 p-2 bg-amber-50/50 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-medium">{alert.title || 'Alerta'}</p>
                      <p className="text-[11px] text-gray-500">{alert.description || '—'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {lowInventory > 0 && (
              <div className="mt-3 p-2 bg-red-50 rounded-lg">
                <p className="text-xs font-medium text-red-700 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {lowInventory} item{lowInventory !== 1 ? 's' : ''} con inventario bajo
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border border-gray-200 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-500" />
              Transacciones Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No hay transacciones registradas</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Fecha</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Descripción</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Categoría</th>
                      <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Tipo</th>
                      <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{formatDate(tx.date)}</td>
                        <td className="py-2 px-3 text-xs font-medium">
                          {tx.description || '—'}
                        </td>
                        <td className="py-2 px-3">
                          <Badge variant="outline" className="text-[10px]">
                            {txCategoryLabel(tx.category)}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            variant="outline"
                            className={
                              tx.type === 'income'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]'
                                : 'bg-red-50 text-red-700 border-red-200 text-[10px]'
                            }
                          >
                            {tx.type === 'income' ? 'Ingreso' : 'Gasto'}
                          </Badge>
                        </td>
                        <td className={`py-2 px-3 text-xs text-right font-medium ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}