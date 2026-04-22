import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { X, PawPrint, Stethoscope, GitBranch, Baby, Calendar, Weight, Ruler, MapPin, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Animal } from '@/types';

type DetailTab = 'profile' | 'health' | 'genealogy' | 'reproduction';

interface DetailPanelProps {
  store: ReturnType<typeof useStore>;
  animalId: string;
  onClose: () => void;
}

export function DetailPanel({ store, animalId, onClose }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('profile');
  const animal = store.animals.find((a) => a.id === animalId);

  if (!animal) return null;

  const father = store.animals.find((a) => a.id === animal.fatherId);
  const mother = store.animals.find((a) => a.id === animal.motherId);
  const children = store.animals.filter((a) => a.fatherId === animal.id || a.motherId === animal.id);
  const medicalRecords = store.medicalRecords.filter((r) => r.animalId === animal.id);
  const reproRecords = store.reproductionRecords.filter((r) => r.animalId === animal.id);
  const productionRecords = store.productionRecords.filter((r) => r.animalId === animal.id);

  const statusColors = {
    active: 'bg-green-100 text-green-700 border-green-200',
    sold: 'bg-blue-100 text-blue-700 border-blue-200',
    deceased: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const reproColors = {
    empty: 'bg-gray-100 text-gray-600',
    pregnant: 'bg-pink-100 text-pink-700',
    in_heat: 'bg-amber-100 text-amber-700',
  };

  const tabs: { id: DetailTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'profile', label: 'Perfil', icon: <PawPrint size={14} /> },
    { id: 'health', label: 'Salud', icon: <Stethoscope size={14} />, count: medicalRecords.length },
    { id: 'genealogy', label: 'Genealogia', icon: <GitBranch size={14} />, count: children.length > 0 ? children.length : undefined },
    { id: 'reproduction', label: 'Reproduccion', icon: <Baby size={14} />, count: reproRecords.length },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[90]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[450px] max-w-[90vw] bg-white shadow-2xl border-l border-gray-200 z-[95] animate-slide-in-right overflow-y-auto">
        {/* Header Image */}
        <div className="relative h-48 bg-gray-100">
          <img
            src={animal.image}
            alt={animal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-3 left-4">
            <h2 className="text-white text-xl font-bold">{animal.name}</h2>
            <p className="text-white/80 text-sm">{animal.id} - {animal.breed}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-gray-800 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-0.5 px-1.5 py-0.5 bg-gray-100 rounded-full text-[10px]">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fade-in">
              {/* Status */}
              <div className="flex gap-2">
                <Badge variant="outline" className={cn(statusColors[animal.status])}>
                  {animal.status === 'active' ? 'Activo' : animal.status === 'sold' ? 'Vendido' : 'Fallecido'}
                </Badge>
                {animal.reproductiveStatus && (
                  <Badge variant="outline" className={cn(reproColors[animal.reproductiveStatus])}>
                    {animal.reproductiveStatus === 'pregnant' ? 'Preñada' : animal.reproductiveStatus === 'in_heat' ? 'En celo' : 'Vacia'}
                  </Badge>
                )}
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={<Calendar size={14} />} label="Nacimiento" value={animal.dateOfBirth} />
                <InfoCard icon={<PawPrint size={14} />} label="Sexo" value={animal.sex === 'female' ? 'Hembra' : 'Macho'} />
                <InfoCard icon={<Weight size={14} />} label="Peso" value={`${animal.weightKg} kg`} />
                <InfoCard icon={<Ruler size={14} />} label="Altura" value={`${animal.heightCm} cm`} />
                <InfoCard icon={<MapPin size={14} />} label="Ubicacion" value={animal.location} />
                <InfoCard icon={<Heart size={14} />} label="Condicion" value={animal.bodyCondition} />
              </div>

              {/* Parents */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Progenitores</h3>
                <div className="grid grid-cols-2 gap-2">
                  <ParentCard label="Padre" animal={father} />
                  <ParentCard label="Madre" animal={mother} />
                </div>
              </div>

              {/* Reproduction Info */}
              {animal.reproductionType && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reproduccion</h3>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                    <p>
                      <span className="text-gray-500">Tipo:</span>{' '}
                      {animal.reproductionType === 'natural' ? 'Monta natural' : animal.reproductionType === 'insemination' ? 'Inseminacion artificial' : 'Transferencia de embrion'}
                    </p>
                    {animal.estimatedDueDate && (
                      <p>
                        <span className="text-gray-500">Fecha estimada de parto:</span>{' '}
                        <span className="font-medium text-pink-600">{animal.estimatedDueDate}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Production */}
              {productionRecords.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Produccion Reciente</h3>
                  <div className="space-y-1">
                    {productionRecords.slice(-3).reverse().map((pr) => (
                      <div key={pr.id} className="flex justify-between text-sm py-1 border-b border-gray-50">
                        <span className="text-gray-500">{pr.date}</span>
                        {pr.milkLiters && <span>{pr.milkLiters} L leche</span>}
                        {pr.weightKg && <span>{pr.weightKg} kg</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-3 animate-fade-in">
              {medicalRecords.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No hay registros medicos</p>
              ) : (
                medicalRecords.map((record) => (
                  <div key={record.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px]',
                          record.type === 'vaccination' && 'bg-green-50 text-green-700 border-green-200',
                          record.type === 'treatment' && 'bg-amber-50 text-amber-700 border-amber-200',
                          record.type === 'checkup' && 'bg-blue-50 text-blue-700 border-blue-200'
                        )}
                      >
                        {record.type === 'vaccination' ? 'Vacunacion' : record.type === 'treatment' ? 'Tratamiento' : 'Chequeo'}
                      </Badge>
                      <span className="text-[10px] text-gray-400">{record.date}</span>
                    </div>
                    <p className="text-sm font-medium">{record.description}</p>
                    {record.medication && (
                      <p className="text-xs text-gray-500 mt-1">
                        {record.medication} {record.dose && `- ${record.dose}`}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">{record.veterinarian}</p>
                    {record.nextDate && (
                      <p className="text-[10px] text-blue-500 mt-1">Proximo: {record.nextDate}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'genealogy' && (
            <div className="space-y-4 animate-fade-in">
              {/* Parents */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Padres</h3>
                <div className="grid grid-cols-2 gap-2">
                  <GenealogyNodeCard animal={father} type="father" />
                  <GenealogyNodeCard animal={mother} type="mother" />
                </div>
              </div>

              {/* Grandparents */}
              {(father?.fatherId || father?.motherId || mother?.fatherId || mother?.motherId) && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Abuelos</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {father?.fatherId && (
                      <GenealogyNodeCard
                        animal={store.animals.find((a) => a.id === father.fatherId)}
                        type="grandfather"
                      />
                    )}
                    {father?.motherId && (
                      <GenealogyNodeCard
                        animal={store.animals.find((a) => a.id === father.motherId)}
                        type="grandmother"
                      />
                    )}
                    {mother?.fatherId && (
                      <GenealogyNodeCard
                        animal={store.animals.find((a) => a.id === mother.fatherId)}
                        type="grandfather"
                      />
                    )}
                    {mother?.motherId && (
                      <GenealogyNodeCard
                        animal={store.animals.find((a) => a.id === mother.motherId)}
                        type="grandmother"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Children */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Descendientes ({children.length})
                </h3>
                {children.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No hay descendientes registrados</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {children.map((child) => (
                      <GenealogyNodeCard key={child.id} animal={child} type="child" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reproduction' && (
            <div className="space-y-3 animate-fade-in">
              {reproRecords.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No hay registros de reproduccion</p>
              ) : (
                reproRecords.map((record) => (
                  <div key={record.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px]',
                          record.status === 'pregnant' && 'bg-pink-50 text-pink-700 border-pink-200',
                          record.status === 'in_heat' && 'bg-amber-50 text-amber-700 border-amber-200',
                          record.status === 'empty' && 'bg-gray-50 text-gray-600 border-gray-200'
                        )}
                      >
                        {record.status === 'pregnant' ? 'Preñada' : record.status === 'in_heat' ? 'En celo' : 'Vacia'}
                      </Badge>
                      <span className="text-[10px] text-gray-400">{record.serviceDate}</span>
                    </div>
                    <p className="text-sm">
                      Tipo: {record.type === 'natural' ? 'Monta natural' : record.type === 'insemination' ? 'Inseminacion artificial' : 'Transferencia de embrion'}
                    </p>
                    {record.estimatedDueDate && (
                      <p className="text-xs text-pink-600 mt-1">
                        Parto estimado: {record.estimatedDueDate}
                      </p>
                    )}
                    {record.actualBirthDate && (
                      <p className="text-xs text-green-600 mt-1">
                        Parto real: {record.actualBirthDate}
                      </p>
                    )}
                    {record.offspringId && (
                      <p className="text-xs text-blue-600 mt-1">
                        Cria: {store.animals.find((a) => a.id === record.offspringId)?.name || record.offspringId}
                      </p>
                    )}
                    {record.notes && <p className="text-xs text-gray-500 mt-1">{record.notes}</p>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function ParentCard({ label, animal }: { label: string; animal?: Animal }) {
  if (!animal) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 text-center">
        <p className="text-[10px] text-gray-400 uppercase">{label}</p>
        <p className="text-sm text-gray-400 mt-1">Desconocido</p>
      </div>
    );
  }
  return (
    <button
      onClick={() => {}}
      className="bg-gray-50 rounded-lg p-3 text-left hover:bg-gray-100 transition-colors"
    >
      <p className="text-[10px] text-gray-400 uppercase">{label}</p>
      <p className="text-sm font-medium">{animal.name}</p>
      <p className="text-xs text-gray-500">{animal.id}</p>
    </button>
  );
}

function GenealogyNodeCard({
  animal,
  type,
}: {
  animal?: Animal;
  type: 'father' | 'mother' | 'grandfather' | 'grandmother' | 'child';
}) {
  const labels: Record<string, string> = {
    father: 'Padre',
    mother: 'Madre',
    grandfather: 'Abuelo',
    grandmother: 'Abuela',
    child: 'Hijo/a',
  };

  if (!animal) {
    return (
      <div className="bg-gray-50 rounded-lg p-3 border border-dashed border-gray-200">
        <p className="text-[10px] text-gray-400">{labels[type]}</p>
        <p className="text-sm text-gray-300 mt-1">No registrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
      <p className="text-[10px] text-gray-400">{labels[type]}</p>
      <div className="flex items-center gap-2 mt-1">
        <img src={animal.image} alt={animal.name} className="w-8 h-8 rounded-full object-cover" />
        <div>
          <p className="text-sm font-medium">{animal.name}</p>
          <p className="text-[10px] text-gray-500">{animal.id} - {animal.breed}</p>
        </div>
      </div>
    </div>
  );
}
