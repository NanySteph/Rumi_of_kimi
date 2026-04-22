import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Baby, Plus, Calendar, Heart, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReproductionProps {
  store: ReturnType<typeof useStore>;
}

export function Reproduction({ store }: ReproductionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    animalId: '',
    type: 'natural' as 'natural' | 'insemination' | 'embryo',
    serviceDate: '',
    status: 'empty' as 'empty' | 'pregnant' | 'in_heat',
    estimatedDueDate: '',
    notes: '',
  });

  const reproRecords = store.reproductionRecords;
  const pregnantAnimals = store.animals.filter((a) => a.reproductiveStatus === 'pregnant');
  const inHeatAnimals = store.animals.filter((a) => a.reproductiveStatus === 'in_heat');
  const emptyAnimals = store.animals.filter(
    (a) => a.sex === 'female' && a.status === 'active' && (!a.reproductiveStatus || a.reproductiveStatus === 'empty')
  );

  const upcomingBirths = pregnantAnimals
    .filter((a) => a.estimatedDueDate)
    .sort((a, b) => (a.estimatedDueDate || '').localeCompare(b.estimatedDueDate || ''));

  const handleAddRecord = () => {
    if (!newRecord.animalId || !newRecord.serviceDate) {
      toast.error('Animal y fecha de servicio son requeridos');
      return;
    }
    store.addReproductionRecord({
      ...newRecord,
      estimatedDueDate: newRecord.estimatedDueDate || undefined,
    });
    // Update animal reproductive status
    store.updateAnimal(newRecord.animalId, {
      reproductiveStatus: newRecord.status,
      reproductionType: newRecord.type,
      estimatedDueDate: newRecord.estimatedDueDate || undefined,
    });
    toast.success('Registro de reproduccion agregado');
    setAddDialogOpen(false);
    setNewRecord({
      animalId: '',
      type: 'natural',
      serviceDate: '',
      status: 'empty',
      estimatedDueDate: '',
      notes: '',
    });
  };

  const statusConfig = {
    pregnant: { label: 'Preñada', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: <Heart size={14} className="text-pink-500" /> },
    in_heat: { label: 'En Celo', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <AlertCircle size={14} className="text-amber-500" /> },
    empty: { label: 'Vacia', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: <Calendar size={14} className="text-gray-400" /> },
  };

  const typeLabels = {
    natural: 'Monta Natural',
    insemination: 'Inseminacion AI',
    embryo: 'Transf. Embrion',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Baby size={20} className="text-gray-700" />
            Reproduccion
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pregnantAnimals.length} preñadas - {inHeatAnimals.length} en celo - {upcomingBirths.length} partos proximos
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
              <DialogTitle>Nuevo Registro de Reproduccion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Animal *</Label>
                <Select
                  value={newRecord.animalId}
                  onValueChange={(v) => setNewRecord({ ...newRecord, animalId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hembra..." />
                  </SelectTrigger>
                  <SelectContent>
                    {store.animals
                      .filter((a) => a.sex === 'female' && a.status === 'active')
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.id} - {a.name} ({a.breed})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tipo de Reproduccion</Label>
                <Select
                  value={newRecord.type}
                  onValueChange={(v: 'natural' | 'insemination' | 'embryo') =>
                    setNewRecord({ ...newRecord, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">Monta Natural</SelectItem>
                    <SelectItem value="insemination">Inseminacion Artificial</SelectItem>
                    <SelectItem value="embryo">Transferencia de Embrion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fecha de Servicio *</Label>
                <Input
                  type="date"
                  value={newRecord.serviceDate}
                  onChange={(e) => setNewRecord({ ...newRecord, serviceDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={newRecord.status}
                  onValueChange={(v: 'empty' | 'pregnant' | 'in_heat') =>
                    setNewRecord({ ...newRecord, status: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="empty">Vacia</SelectItem>
                    <SelectItem value="pregnant">Preñada</SelectItem>
                    <SelectItem value="in_heat">En Celo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newRecord.status === 'pregnant' && (
                <div>
                  <Label>Fecha Estimada de Parto</Label>
                  <Input
                    type="date"
                    value={newRecord.estimatedDueDate}
                    onChange={(e) => setNewRecord({ ...newRecord, estimatedDueDate: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label>Notas</Label>
                <Input
                  placeholder="Notas adicionales..."
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

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border border-pink-200 bg-pink-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart size={18} className="text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pregnantAnimals.length}</p>
                <p className="text-xs text-gray-600">Preñadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inHeatAnimals.length}</p>
                <p className="text-xs text-gray-600">En Celo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-gray-200 bg-gray-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar size={18} className="text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{emptyAnimals.length}</p>
                <p className="text-xs text-gray-600">Disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Births */}
      <Card className="border border-gray-200 mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar size={16} className="text-pink-500" />
            Proximos Partos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBirths.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No hay partos programados</p>
          ) : (
            <div className="space-y-3">
              {upcomingBirths.map((animal) => {
                const record = reproRecords.find((r) => r.animalId === animal.id && r.status === 'pregnant');
                const daysUntil = animal.estimatedDueDate
                  ? Math.ceil(
                      (new Date(animal.estimatedDueDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;
                return (
                  <div
                    key={animal.id}
                    className="flex items-center gap-4 p-3 bg-pink-50/50 rounded-lg cursor-pointer hover:bg-pink-50 transition-colors"
                    onClick={() => store.openAnimalDetail(animal.id)}
                  >
                    <img
                      src={animal.image}
                      alt={animal.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{animal.name}</p>
                        <Badge variant="outline" className="text-[10px] bg-pink-100 text-pink-700 border-pink-200">
                          {typeLabels[record?.type || 'natural']}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {animal.id} - Servicio: {record?.serviceDate}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-pink-700">
                        {animal.estimatedDueDate}
                      </p>
                      {daysUntil !== null && (
                        <p className="text-[11px] text-gray-500">
                          {daysUntil > 0
                            ? `En ${daysUntil} dias`
                            : daysUntil === 0
                            ? 'Hoy!'
                            : `Hace ${Math.abs(daysUntil)} dias`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Records */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Historial de Reproduccion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Animal</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Tipo</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Fecha Servicio</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Estado</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Parto Est.</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Notas</th>
                </tr>
              </thead>
              <tbody>
                {reproRecords
                  .sort((a, b) => b.serviceDate.localeCompare(a.serviceDate))
                  .map((record) => {
                    const animal = store.animals.find((a) => a.id === record.animalId);
                    const config = statusConfig[record.status];
                    return (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            {animal && (
                              <img
                                src={animal.image}
                                alt={animal.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                            <span className="text-xs font-medium">{animal?.name || record.animalId}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-xs">{typeLabels[record.type]}</td>
                        <td className="py-2 px-3 text-xs">{record.serviceDate}</td>
                        <td className="py-2 px-3">
                          <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                            {config.label}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-xs text-pink-600">{record.estimatedDueDate || '-'}</td>
                        <td className="py-2 px-3 text-xs text-gray-500 max-w-[200px] truncate">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
