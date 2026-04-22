export type AnimalStatus = 'active' | 'sold' | 'deceased';
export type AnimalSex = 'male' | 'female';
export type ReproductionType = 'natural' | 'insemination' | 'embryo';
export type ReproductiveStatus = 'empty' | 'pregnant' | 'in_heat';
export type MedicalType = 'vaccination' | 'treatment' | 'checkup';
export type InventoryCategory = 'medication' | 'food' | 'supply';
export type TransactionCategory = 'sale' | 'veterinary_expense' | 'feed_cost' | 'supply_purchase';
export type TransactionType = 'income' | 'expense';
export type UserRole = 'administrator' | 'veterinarian' | 'worker';
export type AlertType = 'birth' | 'vaccine' | 'inventory';
export type ModuleType = 'dashboard' | 'animals' | 'genealogy' | 'reproduction' | 'health' | 'production' | 'inventory' | 'finance' | 'settings' | 'help';

export interface Animal {
  id: string;
  name: string;
  breed: string;
  dateOfBirth: string;
  sex: AnimalSex;
  status: AnimalStatus;
  weightKg: number;
  heightCm: number;
  bodyCondition: string;
  location: string;
  image: string;
  fatherId?: string;
  motherId?: string;
  reproductionType?: ReproductionType;
  reproductiveStatus?: ReproductiveStatus;
  estimatedDueDate?: string;
}

export interface GenealogyNode {
  id: string;
  animalId: string;
  fatherId?: string;
  motherId?: string;
  childrenIds: string[];
}

export interface MedicalRecord {
  id: string;
  animalId: string;
  type: MedicalType;
  date: string;
  description: string;
  medication?: string;
  dose?: string;
  veterinarian: string;
  medicationImage?: string;
  nextDate?: string;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: InventoryCategory;
  quantity: number;
  unit: string;
  reorderLevel: number;
  lastRestocked: string;
  supplier?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  category: TransactionCategory;
  description: string;
  amount: number;
  type: TransactionType;
  relatedAnimalId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  date: string;
  read: boolean;
}

export interface ProductionRecord {
  id: string;
  animalId: string;
  date: string;
  milkLiters?: number;
  weightKg?: number;
  notes?: string;
}

export interface ReproductionRecord {
  id: string;
  animalId: string;
  type: ReproductionType;
  serviceDate: string;
  status: ReproductiveStatus;
  estimatedDueDate?: string;
  actualBirthDate?: string;
  offspringId?: string;
  notes?: string;
}
