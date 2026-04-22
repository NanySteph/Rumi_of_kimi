import { useStore } from '@/hooks/useStore';
import { PawPrint, Heart, TrendingUp, DollarSign, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardProps {
  store: ReturnType<typeof useStore>;
}

export function Dashboard({ store }: DashboardProps) {
  const totalAnimals = store.animals.filter((a) => a.status === 'active').length;
  const pregnantCount = store.animals.filter((a) => a.reproductiveStatus === 'pregnant').length;
  const inHeatCount = store.animals.filter((a) => a.reproductiveStatus === 'in_heat').length;
  const lowInventory = store.inventory.filter((i) => i.quantity <= i.reorderLevel).length;

  const totalIncome = store.financialTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = store.financialTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const upcomingBirths = store.animals
    .filter((a) => a.estimatedDueDate)
    .sort((a, b) => (a.estimatedDueDate || '').localeCompare(b.estimatedDueDate || ''));

  const recentTransactions = store.financialTransactions
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const recentAlerts = store.alerts
    .filter((a) => !a.read)
    .slice(0, 5);

  const kpiCards = [
    {
      title: 'Total Animales',
      value: totalAnimals.toString(),
      subtitle: `${store.animals.length} registrados`,
      icon: <PawPrint size={20} className="text-blue-500" />,
      trend: `+${store.animals.filter((a) => a.status === 'active' && a.sex === 'female').length} hembras`,
    },
    {
      title: 'Animales Preñadas',
      value: pregnantCount.toString(),
      subtitle: `${inHeatCount} en celo`,
      icon: <Heart size={20} className="text-pink-500" />,
      trend: `${upcomingBirths.length} partos proximos`,
    },
    {
      title: 'Ingresos',
      value: `$${totalIncome.toLocaleString()}`,
      subtitle: 'Acumulado',
      icon: <TrendingUp size={20} className="text-emerald-500" />,
      trend: `$${totalExpense.toLocaleString()} gastos`,
    },
    {
      title: 'Balance',
      value: `$${(totalIncome - totalExpense).toLocaleString()}`,
      subtitle: 'Neto',
      icon: <DollarSign size={20} className="text-amber-500" />,
      trend: totalIncome > totalExpense ? 'Positivo' : 'Negativo',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-48 bg-gray-900">
        <img
          src="/images/farm-hero.jpg"
          alt="Farm"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        <div className="relative z-10 p-6 h-full flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-white mb-1">Bienvenido a Sistema Ganadero</h1>
          <p className="text-white/80 text-sm max-w-lg">
            Gestiona tu ganado, controla la reproduccion, monitorea la salud y optimiza tus operaciones desde un solo lugar.
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
              Partos Proximos
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
                      alt={animal.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{animal.name}</p>
                      <p className="text-xs text-gray-500">{animal.id} - {animal.breed}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200 text-[10px]">
                        Preñada
                      </Badge>
                      <p className="text-[11px] text-gray-500 mt-0.5">{animal.estimatedDueDate}</p>
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
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{alert.title}</p>
                      <p className="text-[11px] text-gray-500">{alert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {lowInventory > 0 && (
              <div className="mt-3 p-2 bg-red-50 rounded-lg">
                <p className="text-xs font-medium text-red-700 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {lowInventory} item(s) con inventario bajo
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Fecha</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Descripcion</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Categoria</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Tipo</th>
                    <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3 text-xs">{tx.date}</td>
                      <td className="py-2 px-3 text-xs font-medium">{tx.description}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-[10px]">
                          {tx.category === 'sale' ? 'Venta' : tx.category === 'veterinary_expense' ? 'Veterinaria' : tx.category === 'feed_cost' ? 'Alimento' : 'Insumos'}
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
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
