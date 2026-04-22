import { useState, useCallback, useEffect } from 'react';
import type {
  Animal,
  MedicalRecord,
  InventoryItem,
  FinancialTransaction,
  User,
  Alert,
  ProductionRecord,
  ReproductionRecord,
  ModuleType,
} from '@/types';
import {
  mockAnimals,
  mockMedicalRecords,
  mockInventory,
  mockFinancialTransactions,
  mockUsers,
  mockAlerts,
  mockProductionRecords,
  mockReproductionRecords,
} from '@/data/mockData';

const STORAGE_KEY = 'sistema-ganadero-data';

interface AppState {
  animals: Animal[];
  medicalRecords: MedicalRecord[];
  inventory: InventoryItem[];
  financialTransactions: FinancialTransaction[];
  users: User[];
  alerts: Alert[];
  productionRecords: ProductionRecord[];
  reproductionRecords: ReproductionRecord[];
}

const defaultState: AppState = {
  animals: mockAnimals,
  medicalRecords: mockMedicalRecords,
  inventory: mockInventory,
  financialTransactions: mockFinancialTransactions,
  users: mockUsers,
  alerts: mockAlerts,
  productionRecords: mockProductionRecords,
  reproductionRecords: mockReproductionRecords,
};

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return defaultState;
}

export function useStore() {
  const [state, setState] = useState<AppState>(loadState);
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Animal CRUD
  const addAnimal = useCallback((animal: Omit<Animal, 'id'>) => {
    const newAnimal: Animal = {
      ...animal,
      id: `AR-${String(state.animals.length + 1).padStart(3, '0')}`,
    };
    setState((prev) => ({
      ...prev,
      animals: [...prev.animals, newAnimal],
    }));
    return newAnimal;
  }, [state.animals.length]);

  const updateAnimal = useCallback((id: string, updates: Partial<Animal>) => {
    setState((prev) => ({
      ...prev,
      animals: prev.animals.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }));
  }, []);

  const deleteAnimal = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      animals: prev.animals.filter((a) => a.id !== id),
    }));
  }, []);

  // Medical record CRUD
  const addMedicalRecord = useCallback((record: Omit<MedicalRecord, 'id'>) => {
    const newRecord: MedicalRecord = {
      ...record,
      id: `MR-${String(state.medicalRecords.length + 1).padStart(3, '0')}`,
    };
    setState((prev) => ({
      ...prev,
      medicalRecords: [...prev.medicalRecords, newRecord],
    }));
    return newRecord;
  }, [state.medicalRecords.length]);

  const deleteMedicalRecord = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      medicalRecords: prev.medicalRecords.filter((r) => r.id !== id),
    }));
  }, []);

  // Inventory CRUD
  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `INV-${String(state.inventory.length + 1).padStart(3, '0')}`,
    };
    setState((prev) => ({
      ...prev,
      inventory: [...prev.inventory, newItem],
    }));
    return newItem;
  }, [state.inventory.length]);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }));
  }, []);

  const deleteInventoryItem = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.filter((i) => i.id !== id),
    }));
  }, []);

  // Financial transaction CRUD
  const addTransaction = useCallback((tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...tx,
      id: `FT-${String(state.financialTransactions.length + 1).padStart(3, '0')}`,
    };
    setState((prev) => ({
      ...prev,
      financialTransactions: [...prev.financialTransactions, newTx],
    }));
    return newTx;
  }, [state.financialTransactions.length]);

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      financialTransactions: prev.financialTransactions.filter((t) => t.id !== id),
    }));
  }, []);

  // User CRUD
  const addUser = useCallback((user: Omit<User, 'id'>) => {
    const newUser: User = {
      ...user,
      id: `USR-${String(state.users.length + 1).padStart(3, '0')}`,
    };
    setState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
    return newUser;
  }, [state.users.length]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
    }));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));
  }, []);

  // Production record CRUD
  const addProductionRecord = useCallback((record: Omit<ProductionRecord, 'id'>) => {
    const newRecord: ProductionRecord = {
      ...record,
      id: `PR-${String(state.productionRecords.length + 1).padStart(3, '0')}`,
    };
    setState((prev) => ({
      ...prev,
      productionRecords: [...prev.productionRecords, newRecord],
    }));
    return newRecord;
  }, [state.productionRecords.length]);

  // Reproduction record CRUD
  const addReproductionRecord = useCallback((record: Omit<ReproductionRecord, 'id'>) => {
    const newRecord: ReproductionRecord = {
      ...record,
      id: `RR-${String(state.reproductionRecords.length + 1).padStart(3, '0')}`,
    };
    setState((prev) => ({
      ...prev,
      reproductionRecords: [...prev.reproductionRecords, newRecord],
    }));
    return newRecord;
  }, [state.reproductionRecords.length]);

  const updateReproductionRecord = useCallback((id: string, updates: Partial<ReproductionRecord>) => {
    setState((prev) => ({
      ...prev,
      reproductionRecords: prev.reproductionRecords.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    }));
  }, []);

  // Alert management
  const markAlertRead = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
    }));
  }, []);

  const deleteAlert = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      alerts: prev.alerts.filter((a) => a.id !== id),
    }));
  }, []);

  // Navigation
  const navigateTo = useCallback((module: ModuleType) => {
    setCurrentModule(module);
    setSelectedAnimalId(null);
    setDetailPanelOpen(false);
  }, []);

  const openAnimalDetail = useCallback((animalId: string) => {
    setSelectedAnimalId(animalId);
    setDetailPanelOpen(true);
  }, []);

  const closeDetailPanel = useCallback(() => {
    setDetailPanelOpen(false);
    setSelectedAnimalId(null);
  }, []);

  // Search
  const globalSearch = useCallback(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: { type: string; title: string; id: string; module: ModuleType }[] = [];

    state.animals.forEach((a) => {
      if (
        a.id.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query) ||
        a.breed.toLowerCase().includes(query) ||
        a.location.toLowerCase().includes(query)
      ) {
        results.push({ type: 'animal', title: `${a.id} - ${a.name} (${a.breed})`, id: a.id, module: 'animals' });
      }
    });

    state.medicalRecords.forEach((r) => {
      const animal = state.animals.find((a) => a.id === r.animalId);
      if (r.description.toLowerCase().includes(query) || r.medication?.toLowerCase().includes(query)) {
        results.push({
          type: 'medical',
          title: `${r.type}: ${r.description} (${animal?.name || r.animalId})`,
          id: r.id,
          module: 'health',
        });
      }
    });

    state.inventory.forEach((i) => {
      if (i.itemName.toLowerCase().includes(query)) {
        results.push({ type: 'inventory', title: `${i.itemName} (${i.quantity} ${i.unit})`, id: i.id, module: 'inventory' });
      }
    });

    state.financialTransactions.forEach((t) => {
      if (t.description.toLowerCase().includes(query)) {
        results.push({ type: 'transaction', title: `${t.description} ($${t.amount})`, id: t.id, module: 'finance' });
      }
    });

    return results.slice(0, 10);
  }, [searchQuery, state]);

  return {
    // State
    ...state,
    currentModule,
    selectedAnimalId,
    searchQuery,
    commandOpen,
    detailPanelOpen,

    // Setters
    setSearchQuery,
    setCommandOpen,

    // CRUD operations
    addAnimal,
    updateAnimal,
    deleteAnimal,
    addMedicalRecord,
    deleteMedicalRecord,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addTransaction,
    deleteTransaction,
    addUser,
    updateUser,
    deleteUser,
    addProductionRecord,
    addReproductionRecord,
    updateReproductionRecord,
    markAlertRead,
    deleteAlert,

    // Navigation
    navigateTo,
    openAnimalDetail,
    closeDetailPanel,
    globalSearch,
  };
}
