// ============================================
// INTERFACES PRINCIPALES DEL SISTEMA
// ============================================

export interface Client {
  id: string;
  name: string;                    // Nombre del Restaurante
  ownerName: string;              // Nombre del Dueño ✅ NUEVO
  phone: string;                  // Número de teléfono ✅ NUEVO
  email: string;                  // Email ✅ NUEVO
  services: string[];             // Array de servicios activos
  tableCount?: number;            // Número de mesas (requerido para flex-bill y tap-order-pay) ✅ NUEVO
  active: boolean;                // Estado activo/inactivo
  createdAt: string;             // Fecha de creación
  updatedAt?: string;            // Fecha de última actualización ✅ NUEVO
}

export interface Branch {
  id: string;
  clientId: string;              // FK hacia Client
  name: string;                  // Nombre de la sucursal
  address: string;               // Dirección completa
  tables: number;                // Número de mesas
  active: boolean;               // Estado activo/inactivo
  createdAt?: string;            // Fecha de creación ✅ NUEVO
  updatedAt?: string;            // Fecha de última actualización ✅ NUEVO
}

export interface QrCode {
  id: string;
  branchId: string;              // FK hacia Branch
  tableNumber: number;           // Número de mesa
  url: string;                   // URL generada del QR
  createdAt: string;             // Fecha de creación
}

// ============================================
// TIPOS PARA FORMULARIOS
// ============================================

export type ClientFormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>;
export type ClientFormDataWithInvitation = ClientFormData & {
  sendInvitation?: boolean;
};
export type BranchFormData = Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================
// TIPOS PARA APIS
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// SERVICIOS DISPONIBLES
// ============================================

export interface ServiceOption {
  id: string;
  label: string;
  description?: string;
}

export const AVAILABLE_SERVICES: ServiceOption[] = [
  {
    id: 'tap-order-pay',
    label: 'Tap Order & Pay',
    description: 'Sistema de pedidos y pagos con QR'
  },
  {
    id: 'flex-bill',
    label: 'Flex Bill',
    description: 'Facturación flexible y digital'
  },
  {
    id: 'food-hall',
    label: 'Food Hall',
    description: 'Gestión de patios de comida'
  },
  {
    id: 'tap-pay',
    label: 'Tap & Pay',
    description: 'Pagos rápidos con tecnología contactless'
  },
  {
    id: 'pick-n-go',
    label: 'Pick N Go',
    description: 'Sistema de recogida express'
  }
];

// ============================================
// TIPOS PARA ESTADOS DE UI
// ============================================

export interface LoadingState {
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
}

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  data?: any;
}

// ============================================
// TIPOS DE VALIDACIÓN
// ============================================

export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: ValidationError[];
}