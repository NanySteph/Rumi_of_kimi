import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { PawPrint, Plus, Search, Filter, Grid3X3, List, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AnimalStatus, AnimalSex, ReproductionType, ReproductiveStatus } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAnimalValidation } from '@/hooks/Useanimalvalidation';

interface AnimalsProps {
  store: ReturnType<typeof useStore>;
}

type ViewMode = 'grid' | 'list';

// Small helper to show field-level error messages
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle size={12} />
      {message}
    </p>
  );
}

export function Animals({ store }: AnimalsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AnimalStatus | 'all'>('active');
  const [sexFilter, setSexFilter] = useState<AnimalSex | 'all'>('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const [newAnimal, setNewAnimal] = useState({
    name: '',
    id: '',
    breed: '',
    dateOfBirth: '',
    sex: 'female' as AnimalSex,
    status: 'active' as AnimalStatus,
    weightKg: '',
    heightCm: '',
    bodyCondition: 'Buena',
    location: '',
    fatherId: '',
    motherId: '',
    reproductionType: undefined as ReproductionType | undefined,
    reproductiveStatus: undefined as ReproductiveStatus | undefined,
  });

  const { errors, hasErrors, handleBlur, handleChange, validateAll, clearErrors } =
    useAnimalValidation(store.animals);

  // Helpers so we don't repeat patterns
  const fieldClass = (field: string) =>
    cn(errors[field as keyof typeof errors] ? 'border-red-400 focus-visible:ring-red-300' : '');

  const filteredAnimals = store.animals.filter((animal) => {
    const matchesSearch =
      !search ||
      animal.name.toLowerCase().includes(search.toLowerCase()) ||
      animal.id.toLowerCase().includes(search.toLowerCase()) ||
      animal.breed.toLowerCase().includes(search.toLowerCase()) ||
      animal.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || animal.status === statusFilter;
    const matchesSex = sexFilter === 'all' || animal.sex === sexFilter;
    return matchesSearch && matchesStatus && matchesSex;
  });

  const activeAnimals = filteredAnimals.filter((a) => a.status === 'active');
  const soldAnimals = filteredAnimals.filter((a) => a.status === 'sold');
  const deceasedAnimals = filteredAnimals.filter((a) => a.status === 'deceased');

  const handleAddAnimal = () => {
    const validationErrors = validateAll(newAnimal);
    if (Object.values(validationErrors).some(Boolean)) {
      toast.error('Por favor corrige los errores antes de guardar');
      return;
    }

    store.addAnimal({
      ...newAnimal,
      weightKg: Number(newAnimal.weightKg) || 0,
      heightCm: Number(newAnimal.heightCm) || 0,
      image: `/images/cow-${Math.floor(Math.random() * 10) + 1}.jpg`,
      fatherId: newAnimal.fatherId || undefined,
      motherId: newAnimal.motherId || undefined,
      reproductionType: newAnimal.reproductionType,
      reproductiveStatus: newAnimal.reproductiveStatus,
    });

    toast.success(`Animal ${newAnimal.name} agregado exitosamente`);
    setAddDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewAnimal({
      name: '',
      id: '',
      breed: '',
      dateOfBirth: '',
      sex: 'female',
      status: 'active',
      weightKg: '',
      heightCm: '',
      bodyCondition: 'Buena',
      location: '',
      fatherId: '',
      motherId: '',
      reproductionType: undefined,
      reproductiveStatus: undefined,
    });
    clearErrors();
  };

  const handleDialogOpenChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) resetForm();
  };

  // Generic field change handler
  const set = <K extends keyof typeof newAnimal>(field: K, value: (typeof newAnimal)[K]) => {
    const updated = { ...newAnimal, [field]: value };

    // Auto-clear reproductive fields when switching to male
    if (field === 'sex' && value === 'male') {
      updated.reproductiveStatus = undefined;
    }

    setNewAnimal(updated);
    handleChange(field, value, updated);
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    sold: 'bg-blue-100 text-blue-700 border-blue-200',
    deceased: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const reproColors: Record<string, string> = {
    empty: 'bg-gray-100 text-gray-600',
    pregnant: 'bg-pink-100 text-pink-700',
    in_heat: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <PawPrint size={20} className="text-gray-700" />
            Animales
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {store.animals.length} animales registrados - {activeAnimals.length} activos
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#232529] hover:bg-black">
              <Plus size={16} className="mr-1" />
              Agregar Animal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Animal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">

              {/* ID + Nombre */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="animal-id">
                    ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="animal-id"
                    placeholder="Ej: RA-000"
                    value={newAnimal.id}
                    className={fieldClass('id')}
                    onChange={(e) => set('id', e.target.value)}
                    onBlur={() => handleBlur('id', newAnimal.id, newAnimal)}
                  />
                  <FieldError message={errors.id} />
                </div>
                <div>
                  <Label htmlFor="animal-name">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="animal-name"
                    placeholder="Nombre del animal"
                    value={newAnimal.name}
                    className={fieldClass('name')}
                    onChange={(e) => set('name', e.target.value)}
                    onBlur={() => handleBlur('name', newAnimal.name, newAnimal)}
                  />
                  <FieldError message={errors.name} />
                </div>
              </div>

              {/* Raza */}
              <div>
                <Label htmlFor="animal-breed">
                  Raza <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="animal-breed"
                  placeholder="Ej: Holstein, Angus..."
                  value={newAnimal.breed}
                  className={fieldClass('breed')}
                  onChange={(e) => set('breed', e.target.value)}
                  onBlur={() => handleBlur('breed', newAnimal.breed, newAnimal)}
                />
                <FieldError message={errors.breed} />
              </div>

              {/* Fecha + Sexo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={newAnimal.dateOfBirth}
                    className={fieldClass('dateOfBirth')}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => set('dateOfBirth', e.target.value)}
                    onBlur={() => handleBlur('dateOfBirth', newAnimal.dateOfBirth, newAnimal)}
                  />
                  <FieldError message={errors.dateOfBirth} />
                </div>
                <div>
                  <Label>Sexo</Label>
                  <Select
                    value={newAnimal.sex}
                    onValueChange={(v: AnimalSex) => set('sex', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">Hembra</SelectItem>
                      <SelectItem value="male">Macho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Peso + Altura */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Peso (kg)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000}
                    placeholder="0"
                    value={newAnimal.weightKg}
                    className={fieldClass('weightKg')}
                    onChange={(e) => set('weightKg', e.target.value)}
                    onBlur={() => handleBlur('weightKg', newAnimal.weightKg, newAnimal)}
                  />
                  <FieldError message={errors.weightKg} />
                </div>
                <div>
                  <Label>Altura (cm)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={155}
                    placeholder="0"
                    value={newAnimal.heightCm}
                    className={fieldClass('heightCm')}
                    onChange={(e) => set('heightCm', e.target.value)}
                    onBlur={() => handleBlur('heightCm', newAnimal.heightCm, newAnimal)}
                  />
                  <FieldError message={errors.heightCm} />
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <Label>Ubicación</Label>
                <Input
                  placeholder="Ej: Establo..."
                  value={newAnimal.location}
                  onChange={(e) => set('location', e.target.value)}
                />
              </div>

              {/* Padre + Madre */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Padre (ID)</Label>
                  <Input
                    placeholder="ID del padre"
                    value={newAnimal.fatherId}
                    className={fieldClass('fatherId')}
                    onChange={(e) => set('fatherId', e.target.value)}
                    onBlur={() => handleBlur('fatherId', newAnimal.fatherId, newAnimal)}
                  />
                  <FieldError message={errors.fatherId} />
                </div>
                <div>
                  <Label>Madre (ID)</Label>
                  <Input
                    placeholder="ID de la madre"
                    value={newAnimal.motherId}
                    className={fieldClass('motherId')}
                    onChange={(e) => set('motherId', e.target.value)}
                    onBlur={() => handleBlur('motherId', newAnimal.motherId, newAnimal)}
                  />
                  <FieldError message={errors.motherId} />
                </div>
              </div>

              {/* Reproducción */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo de Reproducción</Label>
                  <Select
                    value={newAnimal.reproductionType || ''}
                    disabled={newAnimal.sex === 'male'}
                    onValueChange={(v) => set('reproductionType', v as ReproductionType)}
                  >
                    <SelectTrigger className={cn(newAnimal.sex === 'male' && 'opacity-50 cursor-not-allowed')}>
                      <SelectValue placeholder={newAnimal.sex === 'male' ? 'Solo para hembras' : 'Seleccionar...'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="natural">Monta Natural</SelectItem>
                      <SelectItem value="insemination">Inseminación AI</SelectItem>
                      <SelectItem value="embryo">Transferencia Embrión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado Reproductivo</Label>
                  <Select
                    value={newAnimal.reproductiveStatus || ''}
                    disabled={newAnimal.sex === 'male'}
                    onValueChange={(v) => set('reproductiveStatus', v as ReproductiveStatus)}
                  >
                    <SelectTrigger className={cn(newAnimal.sex === 'male' && 'opacity-50 cursor-not-allowed')}>
                      <SelectValue placeholder={newAnimal.sex === 'male' ? 'Solo para hembras' : 'Seleccionar...'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="empty">Vacía</SelectItem>
                      <SelectItem value="pregnant">Preñada</SelectItem>
                      <SelectItem value="in_heat">En Celo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.reproductiveStatus} />
                </div>
              </div>

              {/* Nota informativa si hay errores */}
              {hasErrors && (
                <p className="text-xs text-red-500 flex items-center gap-1 bg-red-50 border border-red-200 rounded px-3 py-2">
                  <AlertCircle size={13} />
                  Revisa los campos marcados en rojo antes de guardar.
                </p>
              )}

              <Button
                onClick={handleAddAnimal}
                disabled={hasErrors}
                className={cn(
                  'w-full',
                  hasErrors
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-[#232529] hover:bg-black'
                )}
              >
                Guardar Animal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar animales..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: AnimalStatus | 'all') => setStatusFilter(v)}>
          <SelectTrigger className="w-32">
            <Filter size={14} className="mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="sold">Vendidos</SelectItem>
            <SelectItem value="deceased">Fallecidos</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sexFilter} onValueChange={(v: AnimalSex | 'all') => setSexFilter(v)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Sexo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="female">Hembras</SelectItem>
            <SelectItem value="male">Machos</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'grid' ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded transition-colors',
              viewMode === 'list' ? 'bg-gray-200 text-gray-800' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Animal Counts Tabs */}
      <div className="flex gap-4 mb-4 text-xs">
        <button
          onClick={() => setStatusFilter('active')}
          className={cn('pb-1 border-b-2 transition-colors', statusFilter === 'active' ? 'border-green-500 text-green-700' : 'border-transparent text-gray-500')}
        >
          Activos ({activeAnimals.length})
        </button>
        <button
          onClick={() => setStatusFilter('sold')}
          className={cn('pb-1 border-b-2 transition-colors', statusFilter === 'sold' ? 'border-blue-500 text-blue-700' : 'border-transparent text-gray-500')}
        >
          Vendidos ({soldAnimals.length})
        </button>
        <button
          onClick={() => setStatusFilter('deceased')}
          className={cn('pb-1 border-b-2 transition-colors', statusFilter === 'deceased' ? 'border-gray-500 text-gray-700' : 'border-transparent text-gray-500')}
        >
          Fallecidos ({deceasedAnimals.length})
        </button>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAnimals.map((animal, index) => (
            <Card
              key={animal.id}
              className={cn(
                'overflow-hidden border border-gray-200 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg animate-fade-in',
              )}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => store.openAnimalDetail(animal.id)}
            >
              <div className="relative h-40 bg-gray-100">
                <img src={animal.image} alt={animal.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className={cn('text-[10px]', statusColors[animal.status])}>
                    {animal.status === 'active' ? 'Activo' : animal.status === 'sold' ? 'Vendido' : 'Fallecido'}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{animal.name}</h3>
                    <p className="text-xs text-gray-500">{animal.id}</p>
                  </div>
                  {animal.reproductiveStatus && (
                    <Badge variant="outline" className={cn('text-[10px]', reproColors[animal.reproductiveStatus])}>
                      {animal.reproductiveStatus === 'pregnant' ? 'Preñada' : animal.reproductiveStatus === 'in_heat' ? 'Celo' : 'Vacía'}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">{animal.breed}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                  <span>{animal.weightKg} kg</span>
                  <span>{animal.sex === 'female' ? 'Hembra' : 'Macho'}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">{animal.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card className="border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Animal</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">ID</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Raza</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Sexo</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Estado</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Reproducción</th>
                  <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-500">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnimals.map((animal) => (
                  <tr
                    key={animal.id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => store.openAnimalDetail(animal.id)}
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <img src={animal.image} alt={animal.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium">{animal.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-xs">{animal.id}</td>
                    <td className="py-2.5 px-4 text-xs">{animal.breed}</td>
                    <td className="py-2.5 px-4 text-xs">{animal.sex === 'female' ? 'Hembra' : 'Macho'}</td>
                    <td className="py-2.5 px-4">
                      <Badge variant="outline" className={cn('text-[10px]', statusColors[animal.status])}>
                        {animal.status === 'active' ? 'Activo' : animal.status === 'sold' ? 'Vendido' : 'Fallecido'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4">
                      {animal.reproductiveStatus ? (
                        <Badge variant="outline" className={cn('text-[10px]', reproColors[animal.reproductiveStatus])}>
                          {animal.reproductiveStatus === 'pregnant' ? 'Preñada' : animal.reproductiveStatus === 'in_heat' ? 'Celo' : 'Vacía'}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-xs">{animal.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredAnimals.length === 0 && (
        <div className="text-center py-12">
          <PawPrint size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm text-gray-500">No se encontraron animales con los filtros seleccionados</p>
        </div>
      )}
    </div>
  );
}