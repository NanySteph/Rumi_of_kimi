import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Stethoscope, Plus, Syringe, Pill, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HealthProps {
  store: ReturnType<typeof useStore>;
}

export function Health({ store }: HealthProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [newRecord, setNewRecord] = useState({
    animalId: '',
    type: 'vaccination' as 'vaccination' | 'treatment' | 'checkup',
    date: '',
    description: '',
    medication: '',
    dose: '',
    veterinarian: '',
    nextDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const medicalRecords = store.medicalRecords;
  const vaccinations = medicalRecords.filter((r) => r.type === 'vaccination');
  const treatments = medicalRecords.filter((r) => r.type === 'treatment');
  const checkups = medicalRecords.filter((r) => r.type === 'checkup');

  const upcomingVaccines = medicalRecords
    .filter((r) => r.nextDate && new Date(r.nextDate) >= new Date())
    .sort((a, b) => (a.nextDate || '').localeCompare(b.nextDate || ''));

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!newRecord.animalId) {
      newErrors.animalId = 'Debes seleccionar un animal';
    }

    if (!newRecord.date) {
      newErrors.date = 'La fecha es obligatoria';
    }

    if (newRecord.date && new Date(newRecord.date) > new Date()) {
      newErrors.date = 'La fecha no puede ser futura';
    }

    if (!newRecord.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleAddRecord = () => {
    if (!validate()) {
      toast.error('Revisa los campos del formulario');
      return;
    }

    store.addMedicalRecord({
      ...newRecord,
      nextDate: newRecord.nextDate || undefined,
    });

    toast.success('Registro medico agregado');
    setAddDialogOpen(false);

    setNewRecord({
      animalId: '',
      type: 'vaccination',
      date: '',
      description: '',
      medication: '',
      dose: '',
      veterinarian: '',
      nextDate: '',
    });

    setErrors({});
  };

  const typeConfig = {
    vaccination: {
      label: 'Vacunacion',
      color: 'bg-green-100 text-green-700 border-green-200',
      icon: <Syringe size={14} className="text-green-500" />,
    },
    treatment: {
      label: 'Tratamiento',
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: <Pill size={14} className="text-amber-500" />,
    },
    checkup: {
      label: 'Chequeo',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: <ClipboardCheck size={14} className="text-blue-500" />,
    },
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope size={20} className="text-gray-700" />
            Salud y Medicacion
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {medicalRecords.length} registros - {vaccinations.length} vacunaciones - {treatments.length} tratamientos
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
              <DialogTitle>Nuevo Registro Medico</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">

              {/* ANIMAL */}
              <div>
                <Label>Animal *</Label>
                <Select
                  value={newRecord.animalId}
                  onValueChange={(v) => {
                    setNewRecord({ ...newRecord, animalId: v });
                    setErrors((e) => ({ ...e, animalId: '' }));
                  }}
                >
                  <SelectTrigger className={errors.animalId ? 'border-red-500' : ''}>
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

                {errors.animalId && (
                  <p className="text-xs text-red-500">{errors.animalId}</p>
                )}
              </div>

              {/* TIPO */}
              <div>
                <Label>Tipo</Label>
                <Select
                  value={newRecord.type}
                  onValueChange={(v: any) =>
                    setNewRecord({ ...newRecord, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination">Vacunacion</SelectItem>
                    <SelectItem value="treatment">Tratamiento</SelectItem>
                    <SelectItem value="checkup">Chequeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* FECHA */}
              <div>
                <Label>Fecha *</Label>
                <Input
                  type="date"
                  value={newRecord.date}
                  className={errors.date ? 'border-red-500' : ''}
                  onChange={(e) => {
                    setNewRecord({ ...newRecord, date: e.target.value });
                    setErrors((err) => ({ ...err, date: '' }));
                  }}
                />
                {errors.date && (
                  <p className="text-xs text-red-500">{errors.date}</p>
                )}
              </div>

              {/* DESCRIPCION */}
              <div>
                <Label>Descripcion *</Label>
                <Input
                  value={newRecord.description}
                  placeholder="Descripcion del procedimiento..."
                  className={errors.description ? 'border-red-500' : ''}
                  onChange={(e) => {
                    setNewRecord({ ...newRecord, description: e.target.value });
                    setErrors((err) => ({ ...err, description: '' }));
                  }}
                />
                {errors.description && (
                  <p className="text-xs text-red-500">{errors.description}</p>
                )}
              </div>

              {/* MEDICACION */}
              {newRecord.type !== 'checkup' && (
                <>
                  <div>
                    <Label>Medicamento</Label>
                    <Input
                      value={newRecord.medication}
                      onChange={(e) =>
                        setNewRecord({ ...newRecord, medication: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <Label>Dosis</Label>
                    <Input
                      value={newRecord.dose}
                      onChange={(e) =>
                        setNewRecord({ ...newRecord, dose: e.target.value })
                      }
                    />
                  </div>
                </>
              )}

              {/* VETERINARIO */}
              <div>
                <Label>Veterinario</Label>
                <Input
                  value={newRecord.veterinarian}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, veterinarian: e.target.value })
                  }
                />
              </div>

              {/* PROXIMA FECHA */}
              <div>
                <Label>Proxima Fecha (opcional)</Label>
                <Input
                  type="date"
                  value={newRecord.nextDate}
                  onChange={(e) =>
                    setNewRecord({ ...newRecord, nextDate: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={handleAddRecord}
                className="w-full bg-[#232529] hover:bg-black"
              >
                Guardar Registro
              </Button>

            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border border-green-200 bg-green-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Syringe size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{vaccinations.length}</p>
                <p className="text-xs text-gray-600">Vacunaciones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Pill size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{treatments.length}</p>
                <p className="text-xs text-gray-600">Tratamientos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardCheck size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{checkups.length}</p>
                <p className="text-xs text-gray-600">Chequeos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Vaccines */}
      {upcomingVaccines.length > 0 && (
        <Card className="border border-gray-200 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Proximas Vacunas / Desparasitaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingVaccines.slice(0, 5).map((record) => {
                const animal = store.animals.find((a) => a.id === record.animalId);
                const daysUntil = record.nextDate
                  ? Math.ceil(
                      (new Date(record.nextDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                  : null;
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 p-2 bg-amber-50/50 rounded-lg"
                  >
                    {animal && (
                      <img
                        src={animal.image}
                        alt={animal.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-medium">
                        {record.medication || record.description}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {animal?.name || record.animalId} - {record.veterinarian}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-amber-700">{record.nextDate}</p>
                      {daysUntil !== null && (
                        <p className="text-[10px] text-gray-500">
                          {daysUntil > 0 ? `En ${daysUntil} dias` : 'Hoy!'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Records */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Historial Medico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {medicalRecords
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((record) => {
                const animal = store.animals.find((a) => a.id === record.animalId);
                const config = typeConfig[record.type];
                return (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 flex-shrink-0">
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                          {config.label}
                        </Badge>
                        <span className="text-[10px] text-gray-400">{record.date}</span>
                      </div>
                      <p className="text-sm font-medium mt-1">{record.description}</p>
                      {record.medication && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          {record.medication} {record.dose && `- ${record.dose}`}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[11px] text-gray-500">
                          {animal?.name || record.animalId}
                        </p>
                        <p className="text-[11px] text-gray-400">{record.veterinarian}</p>
                      </div>
                      {record.nextDate && (
                        <p className="text-[11px] text-blue-500 mt-0.5">
                          Proximo: {record.nextDate}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}