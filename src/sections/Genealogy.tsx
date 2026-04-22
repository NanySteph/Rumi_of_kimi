import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { GitBranch, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GenealogyProps {
  store: ReturnType<typeof useStore>;
}

export function Genealogy({ store }: GenealogyProps) {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(store.animals[0]?.id || '');

  const selectedAnimal = store.animals.find((a) => a.id === selectedAnimalId);

  if (!selectedAnimal) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">No hay animales registrados</p>
      </div>
    );
  }

  const father = store.animals.find((a) => a.id === selectedAnimal.fatherId);
  const mother = store.animals.find((a) => a.id === selectedAnimal.motherId);
  const children = store.animals.filter(
    (a) => a.fatherId === selectedAnimal.id || a.motherId === selectedAnimal.id
  );

  const grandFatherP = father ? store.animals.find((a) => a.id === father.fatherId) : null;
  const grandMotherP = father ? store.animals.find((a) => a.id === father.motherId) : null;
  const grandFatherM = mother ? store.animals.find((a) => a.id === mother.fatherId) : null;
  const grandMotherM = mother ? store.animals.find((a) => a.id === mother.motherId) : null;

  const AnimalCard = ({
    animal,
    label,
    onClick,
    isCenter = false,
  }: {
    animal?: typeof selectedAnimal | null;
    label: string;
    onClick?: () => void;
    isCenter?: boolean;
  }) => (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</span>
      {animal ? (
        <button
          onClick={onClick}
          className={cn(
            'relative p-3 rounded-xl border-2 transition-all hover:shadow-md text-left',
            isCenter
              ? 'border-gray-800 bg-gray-50 w-48'
              : 'border-gray-200 bg-white w-40 hover:border-gray-400'
          )}
        >
          <div className="flex items-center gap-2">
            <img
              src={animal.image}
              alt={animal.name}
              className={cn('rounded-full object-cover', isCenter ? 'w-10 h-10' : 'w-8 h-8')}
            />
            <div className="min-w-0">
              <p className={cn('font-medium truncate', isCenter ? 'text-sm' : 'text-xs')}>
                {animal.name}
              </p>
              <p className="text-[10px] text-gray-500">
                {animal.id} - {animal.breed}
              </p>
            </div>
          </div>
          {animal.reproductiveStatus === 'pregnant' && (
            <Badge className="absolute -top-2 -right-2 bg-pink-500 text-[8px] px-1.5 py-0">
              Preñada
            </Badge>
          )}
        </button>
      ) : (
        <div className="w-40 p-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-center">
          <p className="text-xs text-gray-400">Desconocido</p>
        </div>
      )}
    </div>
  );

  const Connector = ({ direction = 'vertical' }: { direction?: 'vertical' | 'horizontal' | 'branch' }) => (
    <div className="flex items-center justify-center">
      {direction === 'vertical' && <div className="w-0.5 h-6 bg-gray-300" />}
      {direction === 'horizontal' && <div className="w-8 h-0.5 bg-gray-300" />}
      {direction === 'branch' && (
        <div className="relative w-32 h-6">
          <div className="absolute left-1/2 top-0 w-0.5 h-3 bg-gray-300 -translate-x-1/2" />
          <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-300" />
          <div className="absolute left-0 top-3 w-0.5 h-3 bg-gray-300" />
          <div className="absolute right-0 top-3 w-0.5 h-3 bg-gray-300" />
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch size={20} className="text-gray-700" />
            Genealogia
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Arbol genealogico de los animales</p>
        </div>
        <div className="w-64">
          <Select value={selectedAnimalId} onValueChange={setSelectedAnimalId}>
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
      </div>

      {/* Family Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border border-gray-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{children.length}</p>
            <p className="text-xs text-gray-500">Descendientes</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{father || mother ? 1 : 0}</p>
            <p className="text-xs text-gray-500">Generacion conocida</p>
          </CardContent>
        </Card>
        <Card className="border border-gray-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">
              {[grandFatherP, grandMotherP, grandFatherM, grandMotherM].filter(Boolean).length}
            </p>
            <p className="text-xs text-gray-500">Abuelos conocidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tree Visualization */}
      <Card className="border border-gray-200 p-6 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Grandparents Row */}
          <div className="flex justify-center gap-24 mb-0">
            <div className="flex gap-4">
              <AnimalCard
                animal={grandFatherP}
                label="Abuelo Paterno"
                onClick={() => grandFatherP && setSelectedAnimalId(grandFatherP.id)}
              />
              <AnimalCard
                animal={grandMotherP}
                label="Abuela Paterna"
                onClick={() => grandMotherP && setSelectedAnimalId(grandMotherP.id)}
              />
            </div>
            <div className="flex gap-4">
              <AnimalCard
                animal={grandFatherM}
                label="Abuelo Materno"
                onClick={() => grandFatherM && setSelectedAnimalId(grandFatherM.id)}
              />
              <AnimalCard
                animal={grandMotherM}
                label="Abuela Materna"
                onClick={() => grandMotherM && setSelectedAnimalId(grandMotherM.id)}
              />
            </div>
          </div>

          {/* Connectors: Grandparents to Parents */}
          <div className="flex justify-center gap-24">
            <div className="flex gap-4">
              <div className="w-40 flex justify-center">
                <Connector direction="vertical" />
              </div>
              <div className="w-40 flex justify-center">
                <Connector direction="vertical" />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-40 flex justify-center">
                <Connector direction="vertical" />
              </div>
              <div className="w-40 flex justify-center">
                <Connector direction="vertical" />
              </div>
            </div>
          </div>

          {/* Parents Row */}
          <div className="flex justify-center gap-32 mb-0">
            <AnimalCard
              animal={father}
              label="Padre"
              onClick={() => father && setSelectedAnimalId(father.id)}
            />
            <AnimalCard
              animal={mother}
              label="Madre"
              onClick={() => mother && setSelectedAnimalId(mother.id)}
            />
          </div>

          {/* Connectors: Parents to Center */}
          <div className="flex justify-center">
            <Connector direction="branch" />
          </div>

          {/* Center Animal */}
          <div className="flex justify-center mb-0">
            <AnimalCard animal={selectedAnimal} label="Animal Seleccionado" isCenter />
          </div>

          {/* Connector: Center to Children */}
          {children.length > 0 && (
            <div className="flex justify-center">
              <Connector direction="vertical" />
            </div>
          )}

          {/* Children Row */}
          {children.length > 0 && (
            <div>
              <p className="text-center text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                Descendientes ({children.length})
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedAnimalId(child.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-all hover:shadow-sm"
                  >
                    <img src={child.image} alt={child.name} className="w-8 h-8 rounded-full object-cover" />
                    <div className="text-left">
                      <p className="text-xs font-medium">{child.name}</p>
                      <p className="text-[10px] text-gray-500">{child.id}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Navigation */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Users size={16} />
          Navegacion Rapida
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {store.animals
            .filter((a) => a.status === 'active')
            .map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedAnimalId(a.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all',
                  a.id === selectedAnimalId
                    ? 'border-gray-800 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-400 bg-white'
                )}
              >
                <img src={a.image} alt={a.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="text-xs font-medium truncate">{a.name}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
