import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Package, Plus, AlertTriangle, Pill, Wheat, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InventoryProps {
  store: ReturnType<typeof useStore>;
}

export function Inventory({ store }: InventoryProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: '',
    category: 'medication' as 'medication' | 'food' | 'supply',
    quantity: '',
    unit: '',
    reorderLevel: '',
    supplier: '',
  });

  const inventory = store.inventory;
  const medications = inventory.filter((i) => i.category === 'medication');
  const food = inventory.filter((i) => i.category === 'food');
  const supplies = inventory.filter((i) => i.category === 'supply');
  const lowStock = inventory.filter((i) => i.quantity <= i.reorderLevel);

  const handleAddItem = () => {
    if (!newItem.itemName || !newItem.quantity || !newItem.unit) {
      toast.error('Nombre, cantidad y unidad son requeridos');
      return;
    }
    store.addInventoryItem({
      ...newItem,
      quantity: Number(newItem.quantity),
      reorderLevel: Number(newItem.reorderLevel) || 0,
      lastRestocked: new Date().toISOString().split('T')[0],
    });
    toast.success('Item agregado al inventario');
    setAddDialogOpen(false);
    setNewItem({
      itemName: '',
      category: 'medication',
      quantity: '',
      unit: '',
      reorderLevel: '',
      supplier: '',
    });
  };

  const categoryConfig = {
    medication: { label: 'Medicamento', icon: <Pill size={14} className="text-green-500" />, color: 'bg-green-50 text-green-700 border-green-200' },
    food: { label: 'Alimento', icon: <Wheat size={14} className="text-amber-500" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    supply: { label: 'Insumo', icon: <Wrench size={14} className="text-blue-500" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  };

  const getStockStatus = (item: (typeof inventory)[0]) => {
    if (item.quantity <= item.reorderLevel) {
      return { label: 'Bajo', color: 'text-red-600 bg-red-50' };
    }
    if (item.quantity <= item.reorderLevel * 1.5) {
      return { label: 'Medio', color: 'text-amber-600 bg-amber-50' };
    }
    return { label: 'OK', color: 'text-green-600 bg-green-50' };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-gray-700" />
            Inventario
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {inventory.length} items - {lowStock.length} con stock bajo
          </p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#232529] hover:bg-black">
              <Plus size={16} className="mr-1" />
              Agregar Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nuevo Item de Inventario</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Nombre *</Label>
                <Input
                  placeholder="Nombre del item..."
                  value={newItem.itemName}
                  onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(v: 'medication' | 'food' | 'supply') =>
                    setNewItem({ ...newItem, category: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medication">Medicamento</SelectItem>
                    <SelectItem value="food">Alimento</SelectItem>
                    <SelectItem value="supply">Insumo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Cantidad *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Unidad *</Label>
                  <Input
                    placeholder="kg, litros, etc."
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Nivel Minimo (alerta)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newItem.reorderLevel}
                  onChange={(e) => setNewItem({ ...newItem, reorderLevel: e.target.value })}
                />
              </div>
              <div>
                <Label>Proveedor</Label>
                <Input
                  placeholder="Nombre del proveedor..."
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                />
              </div>
              <Button onClick={handleAddItem} className="w-full bg-[#232529] hover:bg-black">
                Guardar Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <Card className="border border-red-200 bg-red-50/30 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-red-700">
              <AlertTriangle size={16} />
              Stock Bajo ({lowStock.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200"
                >
                  {categoryConfig[item.category].icon}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.itemName}</p>
                    <p className="text-[10px] text-gray-500">
                      {item.quantity} {item.unit} (min: {item.reorderLevel})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border border-green-200 bg-green-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Pill size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{medications.length}</p>
                <p className="text-xs text-gray-600">Medicamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-amber-200 bg-amber-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Wheat size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{food.length}</p>
                <p className="text-xs text-gray-600">Alimentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{supplies.length}</p>
                <p className="text-xs text-gray-600">Insumos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Todos los Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Item</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Categoria</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Cantidad</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Estado</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Proveedor</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Ult. Reposicion</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const config = categoryConfig[item.category];
                  return (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {config.icon}
                          <span className="text-xs font-medium">{item.itemName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                          {config.label}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-xs">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-2 px-3">
                        <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', stockStatus.color)}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-500">{item.supplier || '-'}</td>
                      <td className="py-2 px-3 text-xs text-gray-500">{item.lastRestocked}</td>
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
