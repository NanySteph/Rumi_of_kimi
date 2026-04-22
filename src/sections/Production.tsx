import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { TrendingUp, Plus, Droplets, Weight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface ProductionProps {
  store: ReturnType<typeof useStore>;
}

export function Production({ store }: ProductionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    animalId: '',
    date: '',
    milkLiters: '',
    weightKg: '',
    notes: '',
  });

  const productionRecords = store.productionRecords;

  const milkProducers = store.animals.filter(
    (a) => a.sex === 'female' && a.status === 'active'
  );

  const latestMilkRecords = milkProducers
    .map((animal) => {
      const records = productionRecords
        .filter((r) => r.animalId === animal.id && r.milkLiters)
        .sort((a, b) => b.date.localeCompare(a.date));
      return { animal, latest: records[0], total: records.reduce((sum, r) => sum + (r.milkLiters || 0), 0) };
    })
    .filter((m) => m.latest);

  const weightRecords = store.animals
    .filter((a) => a.status === 'active')
    .map((animal) => {
      const records = productionRecords
        .filter((r) => r.animalId === animal.id && r.weightKg)
        .sort((a, b) => b.date.localeCompare(a.date));
      return { animal, latest: records[0] };
    })
    .filter((w) => w.latest);

  const totalMilkThisMonth = productionRecords
    .filter((r) => r.milkLiters && r.date.startsWith('2026-04'))
    .reduce((sum, r) => sum + (r.milkLiters || 0), 0);

  const avgMilkPerCow = latestMilkRecords.length > 0
    ? latestMilkRecords.reduce((sum, m) => sum + (m.latest?.milkLiters || 0), 0) / latestMilkRecords.length
    : 0;

  const handleAddRecord = () => {
    if (!newRecord.animalId || !newRecord.date) {
      toast.error('Animal y fecha son requeridos');
      return;
    }
    if (!newRecord.milkLiters && !newRecord.weightKg) {
      toast.error('Debe ingresar litros de leche o peso');
      return;
    }
    store.addProductionRecord({
      animalId: newRecord.animalId,
      date: newRecord.date,
      milkLiters: newRecord.milkLiters ? Number(newRecord.milkLiters) : undefined,
      weightKg: newRecord.weightKg ? Number(newRecord.weightKg) : undefined,
      notes: newRecord.notes || undefined,
    });
    toast.success('Registro de produccion agregado');
    setAddDialogOpen(false);
    setNewRecord({ animalId: '', date: '', milkLiters: '', weightKg: '', notes: '' });
  };

  // Monthly milk data for chart simulation
  const monthlyData = [
    { month: 'Ene', total: 185.5 },
    { month: 'Feb', total: 192.3 },
    { month: 'Mar', total: 178.8 },
    { month: 'Abr', total: totalMilkThisMonth },
  ];

  const maxMilk = Math.max(...monthlyData.map((d) => d.total));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-700" />
            Produccion
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Leche y ganancia de peso - {productionRecords.length} registros
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#232529] hover:bg-black">
              <Plus size={16} className="mr-1" />
              Nuevo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo Registro de Produccion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Animal *</Label>
                <Select
                  value={newRecord.animalId}
                  onValueChange={(v) => setNewRecord({ ...newRecord, animalId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar animal..." />
                  </SelectTrigger>
                  <SelectContent>
                    {store.animals
                      .filter((a) => a.status === 'active')
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.id} - {a.name} ({a.breed})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Litros de Leche</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={newRecord.milkLiters}
                    onChange={(e) => setNewRecord({ ...newRecord, milkLiters: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newRecord.weightKg}
                    onChange={(e) => setNewRecord({ ...newRecord, weightKg: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Notas</Label>
                <Input
                  placeholder="Notas opcionales..."
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                />
              </div>
              <Button onClick={handleAddRecord} className="w-full bg-[#232529] hover:bg-black">
                Guardar Registro
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Droplets size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgMilkPerCow.toFixed(1)} L</p>
                <p className="text-xs text-gray-600">Promedio leche/vaca</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Droplets size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalMilkThisMonth.toFixed(1)} L</p>
                <p className="text-xs text-gray-600">Produccion abril</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Weight size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weightRecords.length}</p>
                <p className="text-xs text-gray-600">Con seguimiento de peso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Chart */}
      <Card className="border border-gray-200 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            Produccion Mensual de Leche (Litros)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-6 h-40 px-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-600">{data.total.toFixed(1)} L</span>
                <div
                  className="w-full max-w-[60px] bg-blue-400 rounded-t-md transition-all hover:bg-blue-500"
                  style={{ height: `${(data.total / maxMilk) * 120}px` }}
                />
                <span className="text-xs text-gray-500">{data.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Milk Production Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Droplets size={16} className="text-blue-500" />
              Produccion de Leche por Vaca
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestMilkRecords.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No hay registros de leche</p>
            ) : (
              <div className="space-y-3">
                {latestMilkRecords.map(({ animal, latest, total }) => (
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
                      <p className="text-sm font-medium">{animal.name}</p>
                      <p className="text-xs text-gray-500">
                        {animal.breed} - Total: {total.toFixed(1)} L
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">{latest?.milkLiters} L</p>
                      <p className="text-[10px] text-gray-400">{latest?.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weight Tracking */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Weight size={16} className="text-amber-500" />
              Seguimiento de Peso
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weightRecords.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No hay registros de peso</p>
            ) : (
              <div className="space-y-3">
                {weightRecords.map(({ animal, latest }) => (
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
                      <p className="text-sm font-medium">{animal.name}</p>
                      <p className="text-xs text-gray-500">{animal.breed}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-600">{latest?.weightKg} kg</p>
                      <p className="text-[10px] text-gray-400">{latest?.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
