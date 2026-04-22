import { useState } from 'react';
import { useStore } from '@/hooks/useStore';
import { Settings as SettingsIcon, Users, Plus, Shield, UserCheck, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SettingsProps {
  store: ReturnType<typeof useStore>;
}

export function Settings({ store }: SettingsProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'worker' as 'administrator' | 'veterinarian' | 'worker',
  });

  const users = store.users;
  const admins = users.filter((u) => u.role === 'administrator');
  const vets = users.filter((u) => u.role === 'veterinarian');
  const workers = users.filter((u) => u.role === 'worker');

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Nombre y email son requeridos');
      return;
    }
    if (users.some((u) => u.email === newUser.email)) {
      toast.error('Ya existe un usuario con ese email');
      return;
    }
    store.addUser({ ...newUser, active: true });
    toast.success('Usuario agregado exitosamente');
    setAddDialogOpen(false);
    setNewUser({ name: '', email: '', role: 'worker' });
  };

  const toggleUserActive = (userId: string, currentActive: boolean) => {
    store.updateUser(userId, { active: !currentActive });
    toast.success(`Usuario ${currentActive ? 'desactivado' : 'activado'}`);
  };

  const roleConfig = {
    administrator: {
      label: 'Administrador',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: <Shield size={14} className="text-purple-500" />,
      description: 'Acceso completo al sistema',
    },
    veterinarian: {
      label: 'Veterinario',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: <UserCheck size={14} className="text-blue-500" />,
      description: 'Acceso a salud y reproduccion',
    },
    worker: {
      label: 'Trabajador',
      color: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: <User size={14} className="text-gray-500" />,
      description: 'Acceso basico de lectura',
    },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon size={20} className="text-gray-700" />
            Ajustes
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configuracion del sistema y gestion de usuarios
          </p>
        </div>
      </div>

      {/* User Management */}
      <Card className="border border-gray-200 mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users size={16} className="text-gray-500" />
              Usuarios del Sistema
            </CardTitle>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#232529] hover:bg-black">
                  <Plus size={16} className="mr-1" />
                  Agregar Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nuevo Usuario</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label>Nombre *</Label>
                    <Input
                      placeholder="Nombre completo..."
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(v: 'administrator' | 'veterinarian' | 'worker') =>
                        setNewUser({ ...newUser, role: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administrator">Administrador</SelectItem>
                        <SelectItem value="veterinarian">Veterinario</SelectItem>
                        <SelectItem value="worker">Trabajador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleAddUser} className="w-full bg-[#232529] hover:bg-black">
                    Crear Usuario
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-center">
              <p className="text-xl font-bold text-purple-700">{admins.length}</p>
              <p className="text-[11px] text-gray-600">Administradores</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-center">
              <p className="text-xl font-bold text-blue-700">{vets.length}</p>
              <p className="text-[11px] text-gray-600">Veterinarios</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
              <p className="text-xl font-bold text-gray-700">{workers.length}</p>
              <p className="text-[11px] text-gray-600">Trabajadores</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Usuario</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Rol</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Email</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-gray-500">Estado</th>
                  <th className="text-right py-2 px-3 text-xs font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const config = roleConfig[u.role];
                  return (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-800 text-white text-xs font-medium flex items-center justify-center">
                            {u.name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                          <span className="flex items-center gap-1">
                            {config.icon}
                            {config.label}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-500">{u.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-medium',
                            u.active ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100'
                          )}
                        >
                          {u.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Switch
                            checked={u.active}
                            onCheckedChange={() => toggleUserActive(u.id, u.active)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.entries(roleConfig).map(([role, config]) => (
          <Card key={role} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-gray-100">{config.icon}</div>
                <h3 className="text-sm font-medium">{config.label}</h3>
              </div>
              <p className="text-xs text-gray-500">{config.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Info */}
      <Card className="border border-gray-200 mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Informacion del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Version</p>
              <p className="font-medium">Sistema Ganadero Pro v1.0</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total de Animales</p>
              <p className="font-medium">{store.animals.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Registros Medicos</p>
              <p className="font-medium">{store.medicalRecords.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Transacciones</p>
              <p className="font-medium">{store.financialTransactions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
