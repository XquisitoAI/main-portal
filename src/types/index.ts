// ============================================
// INTERFACES PRINCIPALES DEL SISTEMA
// ============================================

export interface Client {
  id: string;
  name: string; // Nombre del Restaurante
  ownerName: string; // Nombre del Dueño ✅ NUEVO
  phone: string; // Número de teléfono ✅ NUEVO
  email: string; // Email ✅ NUEVO
  services: string[]; // Array de servicios activos
  tableCount?: number; // Número de mesas (requerido para flex-bill y tap-order-pay) ✅ NUEVO
  roomCount?: number; // Número de habitaciones (requerido para room-service) ✅ NUEVO
  active: boolean; // Estado activo/inactivo
  createdAt: string; // Fecha de creación
  updatedAt?: string; // Fecha de última actualización ✅ NUEVO
}

export interface RoomRange {
  start: number;
  end: number;
}

export interface Branch {
  id: string;
  clientId: string; // FK hacia Client
  restaurantId?: number; // FK hacia Restaurant
  name: string; // Nombre de la sucursal
  address: string; // Dirección completa
  tables: number; // Número de mesas
  rooms?: number; // Número total de habitaciones (para room-service) - DEPRECATED, usar roomRanges
  roomRanges?: RoomRange[]; // Rangos de habitaciones (ej: [{start: 100, end: 129}, {start: 200, end: 229}])
  branchNumber?: number; // Número de sucursal para URLs
  active: boolean; // Estado activo/inactivo
  createdAt?: string; // Fecha de creación ✅ NUEVO
  updatedAt?: string; // Fecha de última actualización ✅ NUEVO
}

export interface QrCode {
  id: string;
  code: string; // Código único del QR (ej: XQ-AI-A3B7K9)
  clientId: string; // FK hacia Client
  restaurantId: number; // FK hacia Restaurant
  branchId: string; // FK hacia Branch
  branchNumber: number; // Número de sucursal para URLs
  service: "flex-bill" | "tap-order-pay" | "room-service" | "pick-n-go";
  qrType: "table" | "room" | "pickup";
  tableNumber?: number | null; // Número de mesa (para table)
  roomNumber?: number | null; // Número de habitación (para room)
  isActive: boolean; // Estado activo/inactivo
  createdAt: string; // Fecha de creación
  updatedAt?: string; // Fecha de última actualización
  // Relaciones expandidas (cuando se hace JOIN)
  clients?: { id: string; name: string };
  restaurants?: { id: number; name: string };
  branches?: { id: string; name: string; branch_number: number };
}

// ============================================
// TIPOS PARA FORMULARIOS
// ============================================

export type ClientFormData = Omit<Client, "id" | "createdAt" | "updatedAt">;
export type ClientFormDataWithInvitation = ClientFormData & {
  sendInvitation?: boolean;
};
export type BranchFormData = Omit<Branch, "id" | "createdAt" | "updatedAt">;

export interface QrCodeFormData {
  clientId: string;
  restaurantId: number;
  branchId: string;
  branchNumber: number;
  service: "flex-bill" | "tap-order-pay" | "room-service" | "pick-n-go";
  qrType: "table" | "room" | "pickup";
  tableNumber?: number;
  roomNumber?: number;
}

export interface QrCodeBatchFormData extends QrCodeFormData {
  count: number;
  startNumber?: number;
}

export interface QrCodeUpdateData {
  service?: "flex-bill" | "tap-order-pay" | "room-service" | "pick-n-go";
  qrType?: "table" | "room" | "pickup";
  tableNumber?: number | null;
  roomNumber?: number | null;
  isActive?: boolean;
}

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
    id: "tap-order-pay",
    label: "Tap Order & Pay",
    description: "Sistema de pedidos y pagos con QR",
  },
  {
    id: "flex-bill",
    label: "Flex Bill",
    description: "Facturación flexible y digital",
  },
  {
    id: "food-hall",
    label: "Food Hall",
    description: "Gestión de patios de comida",
  },
  {
    id: "tap-pay",
    label: "Tap & Pay",
    description: "Pagos rápidos con tecnología contactless",
  },
  {
    id: "pick-n-go",
    label: "Pick N Go",
    description: "Sistema de recogida express",
  },
  {
    id: "room-service",
    label: "Room Service",
    description: "Servicio a la habitación para hoteles",
  },
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
  mode: "create" | "edit" | "view";
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
