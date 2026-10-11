'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MenuItem,
  Category,
  CartItem,
  Order,
  OrderType,
  OrderStatus,
  PaymentMethod,
  RestaurantTable,
  Customer,
  KOTTicket,
  InventoryItem,
  Expense,
  RestaurantSettings,
  StaffUser,
  AppModule,
  PermissionAction,
} from '@/types/pos';
import {
  initialCategories,
  initialMenuItems,
  initialTables,
  initialCustomers,
  initialOrders,
  initialInventory,
  initialExpenses,
  defaultSettings,
  defaultStaffUsers,
} from '@/data/mockData';

interface POSContextType {
  // Menu & Categories
  categories: Category[];
  menuItems: MenuItem[];
  activeCategoryId: string;
  setActiveCategoryId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  // Cart & POS Order Building
  cart: CartItem[];
  addToCart: (item: MenuItem, notes?: string) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, delta: number) => void;
  clearCart: () => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  selectedTable: string;
  setSelectedTable: (tableNo: string) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (cust: Customer | null) => void;
  orderNotes: string;
  setOrderNotes: (notes: string) => void;

  // Financial calculations
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountValue: number;
  setDiscountValue: (discount: number) => void;
  totalAmount: number;

  // Orders & Checkout
  orders: Order[];
  createOrder: (paymentMethod: PaymentMethod, amountPaid: number) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  activeInvoice: Order | null;
  setActiveInvoice: (order: Order | null) => void;

  // Tables
  tables: RestaurantTable[];
  updateTableStatus: (tableId: string, status: RestaurantTable['status']) => void;

  // Customers
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'totalOrders' | 'createdAt'>) => Customer;

  // KOT
  kots: KOTTicket[];
  updateKOTStatus: (kotId: string, status: KOTTicket['status']) => void;

  // Inventory & Expenses
  inventory: InventoryItem[];
  updateStock: (id: string, delta: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;

  // Settings & Network
  settings: RestaurantSettings;
  updateSettings: (settings: Partial<RestaurantSettings>) => void;
  isOnline: boolean;
  offlineOrdersCount: number;
  syncOfflineData: () => void;

  // Auth & Role-Based Access Control (RBAC)
  staffUsers: StaffUser[];
  currentUser: StaffUser | null;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  setCurrentUser: (user: StaffUser) => void;
  addStaffUser: (user: Omit<StaffUser, 'id' | 'createdAt'>) => void;
  updateStaffUser: (id: string, updates: Partial<StaffUser>) => void;
  deleteStaffUser: (id: string) => void;
  hasPermission: (module: AppModule, action: PermissionAction) => boolean;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MENU: 'zaad_menu_items',
  CATEGORIES: 'zaad_categories',
  ORDERS: 'zaad_orders',
  TABLES: 'zaad_tables',
  CUSTOMERS: 'zaad_customers',
  INVENTORY: 'zaad_inventory',
  EXPENSES: 'zaad_expenses',
  SETTINGS: 'zaad_settings',
  STAFF_USERS: 'zaad_staff_users',
  CURRENT_USER: 'zaad_current_user',
};

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('cat-all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [selectedTable, setSelectedTable] = useState<string>('T-01');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tables, setTables] = useState<RestaurantTable[]>(initialTables);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [kots, setKots] = useState<KOTTicket[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(defaultStaffUsers);
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(defaultStaffUsers[0]);

  const [activeInvoice, setActiveInvoice] = useState<Order | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineOrdersCount, setOfflineOrdersCount] = useState<number>(0);

  // Load from local storage on mount (browser only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedMenu = localStorage.getItem(STORAGE_KEYS.MENU);
      if (savedMenu) setMenuItems(JSON.parse(savedMenu));

      const savedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedTables = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (savedTables) setTables(JSON.parse(savedTables));

      const savedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));

      const savedInventory = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      if (savedInventory) setInventory(JSON.parse(savedInventory));

      const savedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));

      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedStaff = localStorage.getItem(STORAGE_KEYS.STAFF_USERS);
      if (savedStaff) {
        setStaffUsers(JSON.parse(savedStaff));
      } else {
        localStorage.setItem(STORAGE_KEYS.STAFF_USERS, JSON.stringify(defaultStaffUsers));
      }

      const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(defaultStaffUsers[0]));
      }
    } catch (e) {
      console.error('Failed reading localStorage', e);
    }

    // Network status listener
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save changes to localStorage
  const saveToStorage = (key: string, data: unknown) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (err) {
        console.error('Storage save error', err);
      }
    }
  };

  // Cart operations
  const addToCart = (item: MenuItem, notes?: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id
            ? { ...i, quantity: i.quantity + 1, notes: notes || i.notes }
            : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          notes,
          imageUrl: item.imageUrl,
        },
      ];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === menuItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountValue(0);
    setOrderNotes('');
  };

  // Financial calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = settings.taxPercentage;
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const totalAmount = Math.max(0, subtotal + taxAmount - discountValue);

  // Checkout and create order
  const createOrder = (paymentMethod: PaymentMethod, amountPaid: number): Order => {
    const nextOrderNum = (orders[0]?.orderNumber || 1000) + 1;
    const changeDue = Math.max(0, amountPaid - totalAmount);

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: nextOrderNum,
      orderType,
      status: 'PENDING',
      paymentStatus: paymentMethod === 'CASH' && amountPaid < totalAmount ? 'PENDING' : 'PAID',
      paymentMethod,
      tableNumber: orderType === 'DINE_IN' ? selectedTable : undefined,
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      deliveryAddress: selectedCustomer?.address,
      cashierName: 'Admin',
      subtotal,
      taxRate,
      taxAmount,
      discountValue,
      totalAmount,
      amountPaid,
      changeDue,
      notes: orderNotes,
      createdAt: new Date().toISOString(),
      isOffline: !isOnline,
      items: cart.map((item, index) => ({
        id: `oi-${Date.now()}-${index}`,
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        notes: item.notes,
      })),
    };

    // Update orders list
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveToStorage(STORAGE_KEYS.ORDERS, updatedOrders);

    // Generate KOT Ticket for kitchen
    const newKOT: KOTTicket = {
      id: `kot-${Date.now()}`,
      kotNumber: kots.length + 1,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      orderType: newOrder.orderType,
      tableNumber: newOrder.tableNumber,
      status: 'PREPARING',
      items: cart.map((i) => ({ name: i.name, quantity: i.quantity, notes: i.notes })),
      createdAt: new Date().toISOString(),
    };
    setKots((prev) => [newKOT, ...prev]);

    // Update table status if Dine-In
    if (orderType === 'DINE_IN' && selectedTable) {
      setTables((prev) => {
        const next = prev.map((tbl) =>
          tbl.number === selectedTable
            ? { ...tbl, status: 'OCCUPIED' as const, currentOrderId: newOrder.id, currentTotal: totalAmount }
            : tbl
        );
        saveToStorage(STORAGE_KEYS.TABLES, next);
        return next;
      });
    }

    if (!isOnline) {
      setOfflineOrdersCount((c) => c + 1);
    }

    // Set as active invoice for instant receipt view & print
    setActiveInvoice(newOrder);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const updated = prev.map((ord) => {
        if (ord.id === orderId) {
          const upd = { ...ord, status };
          // If completed & Dine-in, free up the table
          if (status === 'COMPLETED' && ord.tableNumber) {
            setTables((tbls) =>
              tbls.map((t) =>
                t.number === ord.tableNumber
                  ? { ...t, status: 'AVAILABLE' as const, currentOrderId: undefined, currentTotal: undefined }
                  : t
              )
            );
          }
          return upd;
        }
        return ord;
      });
      saveToStorage(STORAGE_KEYS.ORDERS, updated);
      return updated;
    });
  };

  const updateTableStatus = (tableId: string, status: RestaurantTable['status']) => {
    setTables((prev) => {
      const updated = prev.map((tbl) => (tbl.id === tableId ? { ...tbl, status } : tbl));
      saveToStorage(STORAGE_KEYS.TABLES, updated);
      return updated;
    });
  };

  const addCustomer = (cust: Omit<Customer, 'id' | 'totalOrders' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now()}`,
      totalOrders: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newCust, ...customers];
    setCustomers(updated);
    saveToStorage(STORAGE_KEYS.CUSTOMERS, updated);
    return newCust;
  };

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    const updated = [newItem, ...menuItems];
    setMenuItems(updated);
    saveToStorage(STORAGE_KEYS.MENU, updated);
  };

  const updateMenuItem = (id: string, patch: Partial<MenuItem>) => {
    setMenuItems((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...patch } : item));
      saveToStorage(STORAGE_KEYS.MENU, updated);
      return updated;
    });
  };

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(STORAGE_KEYS.MENU, updated);
      return updated;
    });
  };

  const updateKOTStatus = (kotId: string, status: KOTTicket['status']) => {
    setKots((prev) => prev.map((k) => (k.id === kotId ? { ...k, status } : k)));
  };

  const updateStock = (id: string, delta: number) => {
    setInventory((prev) => {
      const updated = prev.map((i) =>
        i.id === id ? { ...i, currentStock: Math.max(0, i.currentStock + delta) } : i
      );
      saveToStorage(STORAGE_KEYS.INVENTORY, updated);
      return updated;
    });
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      lastRestocked: new Date().toISOString().split('T')[0],
    };
    const updated = [newItem, ...inventory];
    setInventory(updated);
    saveToStorage(STORAGE_KEYS.INVENTORY, updated);
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveToStorage(STORAGE_KEYS.EXPENSES, updated);
  };

  const updateSettings = (patch: Partial<RestaurantSettings>) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    saveToStorage(STORAGE_KEYS.SETTINGS, updated);
  };

  const syncOfflineData = () => {
    // In production, sends queued items to backend POST /api/orders/sync
    setOfflineOrdersCount(0);
    setOrders((prev) => prev.map((o) => ({ ...o, isOffline: false })));
  };

  // Staff and Role-Based Permissions
  const login = (username: string, password: string) => {
    const user = staffUsers.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password.trim()
    );
    if (!user) {
      return { success: false, message: 'Invalid username or password.' };
    }
    if (!user.isActive) {
      return {
        success: false,
        message: 'This staff account has been deactivated by the Administrator.',
      };
    }
    setCurrentUser(user);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      window.location.href = '/login';
    }
  };

  const handleSetCurrentUser = (user: StaffUser) => {
    setCurrentUser(user);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  };

  const addStaffUser = (newUser: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const created: StaffUser = {
      ...newUser,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...staffUsers, created];
    setStaffUsers(updated);
    saveToStorage(STORAGE_KEYS.STAFF_USERS, updated);
  };

  const updateStaffUser = (id: string, updates: Partial<StaffUser>) => {
    const updated = staffUsers.map((u) => {
      if (u.id === id) {
        const revised = { ...u, ...updates };
        if (currentUser?.id === id) {
          setCurrentUser(revised);
          saveToStorage(STORAGE_KEYS.CURRENT_USER, revised);
        }
        return revised;
      }
      return u;
    });
    setStaffUsers(updated);
    saveToStorage(STORAGE_KEYS.STAFF_USERS, updated);
  };

  const deleteStaffUser = (id: string) => {
    const updated = staffUsers.filter((u) => u.id !== id);
    setStaffUsers(updated);
    saveToStorage(STORAGE_KEYS.STAFF_USERS, updated);
    if (currentUser?.id === id) {
      const fallback = updated[0] || null;
      setCurrentUser(fallback);
      saveToStorage(STORAGE_KEYS.CURRENT_USER, fallback);
    }
  };

  const hasPermission = (module: AppModule, action: PermissionAction): boolean => {
    if (!currentUser) return false;
    // Admins have unrestricted system rights
    if (currentUser.role === 'ADMIN') return true;
    const modPerm = currentUser.permissions[module];
    if (!modPerm) return false;
    return Boolean(modPerm[action]);
  };

  return (
    <POSContext.Provider
      value={{
        categories,
        menuItems,
        activeCategoryId,
        setActiveCategoryId,
        searchQuery,
        setSearchQuery,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        orderType,
        setOrderType,
        selectedTable,
        setSelectedTable,
        selectedCustomer,
        setSelectedCustomer,
        orderNotes,
        setOrderNotes,
        subtotal,
        taxRate,
        taxAmount,
        discountValue,
        setDiscountValue,
        totalAmount,
        orders,
        createOrder,
        updateOrderStatus,
        activeInvoice,
        setActiveInvoice,
        tables,
        updateTableStatus,
        customers,
        addCustomer,
        kots,
        updateKOTStatus,
        inventory,
        updateStock,
        addInventoryItem,
        expenses,
        addExpense,
        settings,
        updateSettings,
        isOnline,
        offlineOrdersCount,
        syncOfflineData,
        staffUsers,
        currentUser,
        login,
        logout,
        setCurrentUser: handleSetCurrentUser,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        hasPermission,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
