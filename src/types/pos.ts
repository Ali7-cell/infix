export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'CASHIER' | 'MANAGER' | 'KITCHEN' | 'WAITER';
export type Role = UserRole;

export type AppModule =
  | 'pos'
  | 'orders'
  | 'tables'
  | 'kitchen'
  | 'menu'
  | 'customers'
  | 'inventory'
  | 'expenses'
  | 'reports'
  | 'settings'
  | 'staff';

export type PermissionAction = 'canView' | 'canAdd' | 'canEdit' | 'canDelete';

export interface ActionPermissions {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface StaffUser {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  permissions: Record<AppModule, ActionPermissions>;
  createdAt: string;
}

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE' | 'SPLIT';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLED';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  barcode?: string;
  categoryId: string;
  categoryName?: string;
  isAvailable: boolean;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  imageUrl?: string;
}

export interface RestaurantTable {
  id: string;
  number: string;
  capacity: number;
  floor: string;
  status: TableStatus;
  currentOrderId?: string;
  currentTotal?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  createdAt: string;
}

export interface OrderItemRecord {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  tableId?: string;
  tableNumber?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  cashierName: string;
  subtotal: number;
  taxRate: number; // e.g. 5%
  taxAmount: number;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  totalAmount: number;
  amountPaid: number;
  changeDue: number;
  notes?: string;
  items: OrderItemRecord[];
  createdAt: string;
  isOffline?: boolean;
}

export interface KOTTicket {
  id: string;
  kotNumber: number;
  orderId: string;
  orderNumber: number;
  tableNumber?: string;
  orderType: OrderType;
  items: {
    name: string;
    quantity: number;
    notes?: string;
  }[];
  status: 'PENDING' | 'PREPARING' | 'READY';
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string; // e.g. "kg", "litre", "pcs", "cans"
  currentStock: number;
  minStockWarn: number;
  unitCost: number;
  lastRestocked: string;
}

export interface Expense {
  id: string;
  title: string;
  category: 'Groceries' | 'Utilities' | 'Staff Salary' | 'Maintenance' | 'Petty Cash' | 'Other';
  amount: number;
  date: string;
  recordedBy: string;
  notes?: string;
}

export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  address: string;
  phone: string;
  taxNumber: string;
  taxPercentage: number;
  currencySymbol: string;
  receiptFooter: string;
}
