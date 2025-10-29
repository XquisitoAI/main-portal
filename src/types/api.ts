// Tipos para las respuestas de la API del backend - Basados en esquema Supabase

// ===== RESTAURANTES =====
export interface Restaurant {
  id: number;
  user_id: number; // FK a user_admin_portal
  name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  opening_hours?: Record<string, any>;
  order_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

// ===== USUARIOS =====
export interface User {
  id: string; // UUID
  clerk_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  age?: number;
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  clerk_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== ÓRDENES =====
export interface UserOrder {
  id: string; // UUID
  table_number: number;
  user_name: string;
  items: Record<string, any>; // JSONB
  total_items: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  payment_status: string;
  paid_amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export interface DishOrder {
  id: string; // UUID
  user_order_id?: string;
  tap_order_id?: string;
  item: string;
  quantity: number;
  price: number;
  status: 'pending' | 'cooking' | 'delivered';
  payment_status: 'not_paid' | 'paid';
  images?: string[];
  custom_fields?: Record<string, any>;
  extra_price: number;
}

export interface TapOrder {
  id: string; // UUID
  table_id: string;
  clerk_user_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  total_amount: number;
  payment_status: 'pending' | 'paid';
  order_status: 'active' | 'confirmed' | 'preparing' | 'completed' | 'abandoned';
  session_data: Record<string, any>;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

// ===== MÉTRICAS DEL DASHBOARD =====
export interface DashboardMetrics {
  // Métricas principales
  total_revenue: number;
  total_orders: number;
  total_volume: number;
  active_restaurants: number;

  // Tendencias temporales
  revenue_trend: Array<{
    period: string;
    value: number;
  }>;

  orders_trend: Array<{
    period: string;
    value: number;
  }>;

  // Distribución por método de pago
  payment_methods: Array<{
    method: string; // card_type de las tablas de payment_methods
    count: number;
    percentage: number;
  }>;

  // Distribución por servicio Xquisito
  services_distribution: Array<{
    service_name: string; // 'Tap Order & Pay', 'Flex Bill', etc.
    usage_count: number;
    revenue: number;
    percentage: number;
  }>;

  // Métricas demográficas (basadas en tabla users)
  demographics?: {
    gender_distribution: Array<{
      gender: string;
      count: number;
      percentage: number;
    }>;
    age_distribution: Array<{
      age_range: string; // '14-17', '18-25', etc.
      count: number;
      percentage: number;
    }>;
  };

  // Items más vendidos (basado en dish_order)
  top_items?: Array<{
    item_name: string;
    quantity_sold: number;
    revenue: number;
  }>;

  // Métricas de satisfacción (basado en reviews)
  satisfaction_metrics?: {
    restaurant_avg_rating: number;
    menu_items_avg_rating: number;
    total_reviews: number;
  };
}

// ===== PAGOS =====
export interface PaymentMethod {
  id: string; // UUID
  guest_id?: string;
  clerk_user_id?: string;
  last_four_digits: string;
  card_type: string;
  card_brand?: string;
  expiry_month: number;
  expiry_year: number;
  cardholder_name?: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

export interface SplitPayment {
  id: string; // UUID
  table_number: number;
  user_id?: string;
  guest_id?: string;
  guest_name?: string;
  expected_amount: number;
  amount_paid: number;
  status: 'pending' | 'paid';
  original_total: number;
  restaurant_id: number;
  created_at: string;
  paid_at?: string;
}

// ===== MENÚ =====
export interface MenuItem {
  id: number;
  section_id: number;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  discount: number;
  custom_fields: Record<string, any>[];
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuSection {
  id: number;
  restaurant_id: number;
  name: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// ===== MESAS =====
export interface Table {
  id: string; // UUID
  table_number: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  restaurant_id: number;
  created_at: string;
  updated_at: string;
}

// ===== RESPUESTAS DE API =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total_count: number;
  has_more: boolean;
  limit: number;
  offset: number;
}

// ===== FILTROS =====
export interface DashboardFilters {
  restaurant_id?: number;
  start_date?: string;
  end_date?: string;
  gender?: 'todos' | 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
  age_range?: 'todos' | '14-17' | '18-25' | '26-35' | '36-45' | '46+';
  granularity?: 'hora' | 'dia' | 'mes' | 'ano';
  service_type?: 'todos' | 'tap_order_pay' | 'flex_bill' | 'food_hall' | 'pick_go';
  payment_status?: 'todos' | 'pending' | 'paid';
  order_status?: 'todos' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

// ===== ANÁLISIS Y REPORTES =====
export interface ServiceAnalytics {
  service_name: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  conversion_rate: number;
  growth_rate: number;
  top_restaurants: Array<{
    restaurant_id: number;
    restaurant_name: string;
    order_count: number;
    revenue: number;
  }>;
}

export interface RestaurantAnalytics {
  restaurant_id: number;
  restaurant_name: string;
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  active_tables: number;
  peak_hours: Array<{
    hour: number;
    order_count: number;
  }>;
  popular_items: Array<{
    item_name: string;
    order_count: number;
    revenue: number;
  }>;
}

// ===== TIPOS PARA SUPER ADMIN =====
export interface SuperAdminDashboard {
  overview: DashboardMetrics;
  restaurants: RestaurantAnalytics[];
  services: ServiceAnalytics[];
  trends: {
    daily_revenue: Array<{ date: string; revenue: number }>;
    weekly_orders: Array<{ week: string; orders: number }>;
    monthly_growth: Array<{ month: string; growth_rate: number }>;
  };
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    restaurant_id?: number;
    created_at: string;
  }>;
}