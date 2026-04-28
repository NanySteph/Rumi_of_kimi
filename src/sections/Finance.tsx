import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { DollarSign, Plus, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FinanceProps {
  store: ReturnType<typeof useStore>;
}

export function Finance({ store }: FinanceProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // ✅ Formato de moneda Lempiras
  const currencyFormatter = new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
  });

  const [newTransaction, setNewTransaction] = useState({
    date: '',
    category: 'sale' as 'sale' | 'veterinary_expense' | 'feed_cost' | 'supply_purchase',
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense',
    relatedAnimalId: '',
  });

  const transactions = store.financialTransactions;
  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleAddTransaction = () => {
    if (!newTransaction.date || !newTransaction.description || !newTransaction.amount) {
      toast.error('Fecha, descripcion y monto son requeridos');
      return;
    }
    store.addTransaction({
      ...newTransaction,
      amount: Number(newTransaction.amount),
      relatedAnimalId: newTransaction.relatedAnimalId || undefined,
    });
    toast.success('Transaccion agregada');
    setAddDialogOpen(false);
    setNewTransaction({
      date: '',
      category: 'sale',
      description: '',
      amount: '',
      type: 'income',
      relatedAnimalId: '',
    });
  };

  const categoryLabels: Record<string, string> = {
    sale: 'Venta',
    veterinary_expense: 'Veterinaria',
    feed_cost: 'Alimento',
    supply_purchase: 'Insumos',
  };

  const categoryColors: Record<string, string> = {
    sale: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    veterinary_expense: 'bg-red-50 text-red-700 border-red-200',
    feed_cost: 'bg-amber-50 text-amber-700 border-amber-200',
    supply_purchase: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const categorySummary = transactions.reduce(
    (acc, t) => {
      if (!acc[t.category]) acc[t.category] = { income: 0, expense: 0 };
      if (t.type === 'income') acc[t.category].income += t.amount;
      else acc[t.category].expense += t.amount;
      return acc;
    },
    {} as Record<string, { income: number; expense: number }>
  );

  const monthlyData = [
    { month: 'Nov', income: 800, expense: 900 },
    { month: 'Dic', income: 800, expense: 350 },
    { month: 'Ene', income: 3700, expense: 830 },
    { month: 'Feb', income: 1200, expense: 780 },
    { month: 'Mar', income: 1350, expense: 1616 },
  ];

  const maxVal = Math.max(...monthlyData.map((d) => Math.max(d.income, d.expense)));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign size={20} className="text-gray-700" />
            Finanzas
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {transactions.length} transacciones - Balance: {currencyFormatter.format(balance)}
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#232529] hover:bg-black">
              <Plus size={16} className="mr-1" />
              Nueva Transaccion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nueva Transaccion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select
                  value={newTransaction.type}
                  onValueChange={(v: 'income' | 'expense') =>
                    setNewTransaction({ ...newTransaction, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Ingreso</SelectItem>
                    <SelectItem value="expense">Gasto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={newTransaction.category}
                  onValueChange={(v: 'sale' | 'veterinary_expense' | 'feed_cost' | 'supply_purchase') =>
                    setNewTransaction({ ...newTransaction, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Venta</SelectItem>
                    <SelectItem value="veterinary_expense">Gasto Veterinario</SelectItem>
                    <SelectItem value="feed_cost">Alimento</SelectItem>
                    <SelectItem value="supply_purchase">Compra Insumos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Descripcion *</Label>
                <Input
                  placeholder="Descripcion de la transaccion..."
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Monto *</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                />
              </div>
              <div>
                <Label>Animal Relacionado (opcional)</Label>
                <Select
                  value={newTransaction.relatedAnimalId}
                  onValueChange={(v) => setNewTransaction({ ...newTransaction, relatedAnimalId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguno</SelectItem>
                    {store.animals.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.id} - {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddTransaction} className="w-full bg-[#232529] hover:bg-black">
                Guardar Transaccion
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{currencyFormatter.format(totalIncome)}</p>
                <p className="text-xs text-gray-600">Ingresos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-red-200 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown size={18} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{currencyFormatter.format(totalExpense)}</p>
                <p className="text-xs text-gray-600">Gastos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn('border', balance >= 0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-red-200 bg-red-50/30')}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', balance >= 0 ? 'bg-emerald-100' : 'bg-red-100')}>
                <Wallet size={18} className={balance >= 0 ? 'text-emerald-600' : 'text-red-600'} />
              </div>
              <div>
                <p className={cn('text-2xl font-bold', balance >= 0 ? 'text-emerald-700' : 'text-red-700')}>
                  {currencyFormatter.format(balance)}
                </p>
                <p className="text-xs text-gray-600">Balance neto</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card className="border border-gray-200 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-500" />
            Resumen Mensual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-6 h-40 px-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex gap-1 w-full max-w-[60px] justify-center">
                  <div
                    className="w-3 bg-emerald-400 rounded-t"
                    style={{ height: `${(data.income / maxVal) * 100}px` }}
                    title={`Ingreso: ${currencyFormatter.format(data.income)}`}
                  />
                  <div
                    className="w-3 bg-red-400 rounded-t"
                    style={{ height: `${(data.expense / maxVal) * 100}px` }}
                    title={`Gasto: ${currencyFormatter.format(data.expense)}`}
                  />
                </div>
                <span className="text-xs text-gray-500">{data.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-400 rounded" />
              <span className="text-xs text-gray-500">Ingresos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-400 rounded" />
              <span className="text-xs text-gray-500">Gastos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables & Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="border border-gray-200 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Transacciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 text-xs text-gray-500">Fecha</th>
                    <th className="text-left py-2 px-3 text-xs text-gray-500">Descripcion</th>
                    <th className="text-left py-2 px-3 text-xs text-gray-500">Categoria</th>
                    <th className="text-right py-2 px-3 text-xs text-gray-500">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 10)
                    .map((tx) => (
                      <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{tx.date}</td>
                        <td className="py-2 px-3 text-xs font-medium">{tx.description}</td>
                        <td className="py-2 px-3">
                          <Badge variant="outline" className={cn('text-[10px]', categoryColors[tx.category])}>
                            {categoryLabels[tx.category]}
                          </Badge>
                        </td>
                        <td className={`py-2 px-3 text-xs text-right font-medium ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}{currencyFormatter.format(tx.amount)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categorySummary).map(([cat, sums]) => {
                const net = sums.income - sums.expense;
                return (
                  <div key={cat} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn('text-[10px]', categoryColors[cat])}>
                        {categoryLabels[cat]}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-xs font-medium', net >= 0 ? 'text-emerald-600' : 'text-red-600')}>
                        {net >= 0 ? '+' : '-'}{currencyFormatter.format(Math.abs(net))}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        +{currencyFormatter.format(sums.income)} / -{currencyFormatter.format(sums.expense)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
