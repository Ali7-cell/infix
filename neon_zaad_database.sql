-- ============================================================================
-- ZAAD RESTAURANT MANAGEMENT SYSTEM (POS & ERP)
-- COMPREHENSIVE PRODUCTION POSTGRESQL SCHEMA FOR NEON DATABASE
-- ============================================================================
-- Features:
-- 1. Native PostgreSQL 13+ Compatibility (Uses native gen_random_uuid())
-- 2. Neon Auth Ready (Supports neon_auth_user_id mapping for auth: true)
-- 3. Centralized 3NF Normalization (Zero data anomalies or redundancy)
-- 4. Granular Role-Based Access Control (Admin vs Receptionist Permission Matrix)
-- 5. Referential Integrity with CASCADE & RESTRICT rules
-- 6. Fast Query Indexes for high-throughput live POS & Kitchen operations
-- 7. Auto-updating timestamps via PL/pgSQL triggers
-- 8. Production seed data including default Admin and Receptionist logins
-- ============================================================================

-- Clean drop for clean migration rerun if needed
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS kot_tickets CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS dining_tables CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS restaurant_settings CASCADE;

-- ============================================================================
-- 1. RESTAURANT SETTINGS (Singleton configuration)
-- ============================================================================
CREATE TABLE restaurant_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    restaurant_name VARCHAR(150) NOT NULL DEFAULT 'Zaad Restaurant',
    tagline VARCHAR(255) DEFAULT 'Authentic Charcoal Grill & Fine Dining',
    phone VARCHAR(50) DEFAULT '+92 300 1234567',
    email VARCHAR(100) DEFAULT 'info@zaadrestaurant.com',
    address TEXT DEFAULT 'Main Boulevard, Gulberg III, Lahore, Pakistan',
    tax_number VARCHAR(100) DEFAULT 'TRN-9847291-ZAAD',
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 16.00 CHECK (tax_percentage >= 0),
    currency_symbol VARCHAR(10) NOT NULL DEFAULT 'PKR',
    receipt_footer TEXT DEFAULT 'Thank you for dining with Zaad! Visit us again soon.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. USERS & Granular RBAC (Admin & Receptionist Authentication)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    neon_auth_user_id VARCHAR(255) UNIQUE, -- Maps directly to Neon Auth (auth: true)
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'RECEPTIONIST', 'CHEF', 'WAITER', 'CASHIER')),
    phone VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_neon_auth ON users(neon_auth_user_id);

-- Granular Permission Matrix per page/module (View, Add, Edit, Delete)
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_name VARCHAR(50) NOT NULL CHECK (
        module_name IN (
            'pos', 'tables', 'orders', 'kitchen', 'menu',
            'inventory', 'expenses', 'reports', 'customers', 'staff', 'settings'
        )
    ),
    can_view BOOLEAN NOT NULL DEFAULT FALSE,
    can_add BOOLEAN NOT NULL DEFAULT FALSE,
    can_edit BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_module UNIQUE (user_id, module_name)
);

CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);

-- ============================================================================
-- 3. MENU CATEGORIES & ITEMS
-- ============================================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50) DEFAULT 'Utensils',
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (cost_price >= 0),
    barcode VARCHAR(100) UNIQUE,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_menu_items_availability ON menu_items(is_available);

-- ============================================================================
-- 4. DINING TABLES & SECTION MANAGEMENT
-- ============================================================================
CREATE TABLE dining_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL DEFAULT 4 CHECK (capacity > 0),
    section VARCHAR(50) NOT NULL DEFAULT 'Main Hall',
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE' CHECK (
        status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'BILLING')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_dining_tables_status ON dining_tables(status);

-- ============================================================================
-- 5. CUSTOMER DIRECTORY
-- ============================================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(120),
    address TEXT,
    total_orders INT NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
    total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);

-- ============================================================================
-- 6. ORDERS & ORDER LINE ITEMS
-- ============================================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number INT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    table_id UUID REFERENCES dining_tables(id) ON DELETE SET NULL,
    order_type VARCHAR(30) NOT NULL CHECK (order_type IN ('DINE_IN', 'TAKEAWAY', 'DELIVERY')),
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED')
    ),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID' CHECK (
        payment_status IN ('PAID', 'UNPAID', 'PARTIAL')
    ),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH' CHECK (
        payment_method IN ('CASH', 'CARD', 'ONLINE', 'UNPAID')
    ),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer ON orders(customer_id);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    item_name VARCHAR(150) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================================
-- 7. KITCHEN ORDER TICKETS (KOT)
-- ============================================================================
CREATE TABLE kot_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number INT NOT NULL,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (
        status IN ('PENDING', 'PREPARING', 'READY', 'DELIVERED')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ready_at TIMESTAMPTZ
);

CREATE INDEX idx_kot_order ON kot_tickets(order_id);
CREATE INDEX idx_kot_status ON kot_tickets(status);

-- ============================================================================
-- 8. INVENTORY STOCK MANAGEMENT
-- ============================================================================
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_name VARCHAR(150) NOT NULL,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Ingredients',
    unit VARCHAR(20) NOT NULL, -- kg, liters, packets, boxes, etc.
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_alert_threshold NUMERIC(10, 2) NOT NULL DEFAULT 5 CHECK (min_alert_threshold >= 0),
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
    supplier_name VARCHAR(150),
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_sku ON inventory_items(sku);
CREATE INDEX idx_inventory_stock ON inventory_items(current_stock);

-- ============================================================================
-- 9. EXPENSES TRACKING
-- ============================================================================
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (
        category IN ('SUPPLIES', 'UTILITIES', 'SALARIES', 'MAINTENANCE', 'MARKETING', 'OTHER')
    ),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'CASH' CHECK (
        payment_method IN ('CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE')
    ),
    paid_to VARCHAR(150),
    notes TEXT,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_date ON expenses(expense_date DESC);
CREATE INDEX idx_expenses_category ON expenses(category);

-- ============================================================================
-- 10. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restaurant_settings_updated
    BEFORE UPDATE ON restaurant_settings
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_user_permissions_updated
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_menu_items_updated
    BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_dining_tables_updated
    BEFORE UPDATE ON dining_tables
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_customers_updated
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_orders_updated
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_inventory_items_updated
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- ============================================================================
-- 11. PRODUCTION SEED DATA (Admin, Receptionist, Menu, Tables, Settings)
-- ============================================================================

-- 1. Insert Singleton Settings
INSERT INTO restaurant_settings (
    id, restaurant_name, tagline, phone, email, address, tax_number, tax_percentage, currency_symbol, receipt_footer
) VALUES (
    1,
    'Zaad Restaurant',
    'Authentic Charcoal Grill & Fine Dining',
    '+92 300 1234567',
    'info@zaadrestaurant.com',
    'Main Boulevard, Gulberg III, Lahore, Pakistan',
    'TRN-9847291-ZAAD',
    16.00,
    'PKR',
    'Thank you for dining with Zaad! Visit us again soon.'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Default Users
-- Default Admin (Password: admin123)
-- Default Receptionist (Password: zaad123)
INSERT INTO users (id, username, password_hash, full_name, role, phone, is_active)
VALUES 
    (
        'a0000000-0000-0000-0000-000000000001',
        'admin',
        'admin123',
        'Zaad General Manager',
        'ADMIN',
        '+92 300 0000001',
        TRUE
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'receptionist',
        'zaad123',
        'Fatima Reception Desk',
        'RECEPTIONIST',
        '+92 300 0000002',
        TRUE
    )
ON CONFLICT (username) DO NOTHING;

-- 3. Populate Admin Permissions (Full Access across all 11 modules)
INSERT INTO user_permissions (user_id, module_name, can_view, can_add, can_edit, can_delete)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'pos', TRUE, TRUE, TRUE, TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'tables', TRUE, TRUE, TRUE, TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'orders', TRUE, TRUE, TRUE, TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'kitchen', TRUE, TRUE, TRUE, TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'menu', TRUE, TRUE, TRUE, TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'inventory', TRUE, TRUE, TRUE, TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'expenses', TRUE, TRUE, TRUE, TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'reports', TRUE, TRUE, TRUE, TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'customers', TRUE, TRUE, TRUE, TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'staff', TRUE, TRUE, TRUE, TRUE),
    ('a0000000-0000-0000-0000-000000000001', 'settings', TRUE, TRUE, TRUE, TRUE)
ON CONFLICT (user_id, module_name) DO NOTHING;

-- 4. Populate Receptionist Permissions (Tailored Reception Access)
-- Can operate POS, manage Tables & Orders, view Customers
-- Restricted from sensitive Financial Reports, Inventory Editing, Staff Management, and Settings
INSERT INTO user_permissions (user_id, module_name, can_view, can_add, can_edit, can_delete)
VALUES
    ('b0000000-0000-0000-0000-000000000002', 'pos', TRUE, TRUE, TRUE, FALSE),
    ('b0000000-0000-0000-0000-000000000002', 'tables', TRUE, TRUE, TRUE, FALSE),
    ('b0000000-0000-0000-0000-000000000002', 'orders', TRUE, TRUE, TRUE, FALSE),
    ('b0000000-0000-0000-0000-000000000002', 'kitchen', TRUE, FALSE, TRUE, FALSE),
    ('b0000000-0000-0000-0000-000000000002', 'menu', TRUE, FALSE, FALSE, FALSE),
    ('b0000000-0000-0000-0000-000000000002', 'inventory', FALSE, FALSE, FALSE, FALSE),
    ('b0000000-0000-0000-0000-000000000002', 'expenses', FALSE, FALSE, FALSE, FALSE),
    ('b0000000-0000-0000-0000-000000000002', 'reports', FALSE, FALSE, FALSE, FALSE),
    ('b0000000-0000-0000-0000-000000000002', 'customers', TRUE, TRUE, TRUE, FALSE),
    ('b0000000-0000-0000-0000-000000000002', 'staff', FALSE, FALSE, FALSE, FALSE),
    ('b0000000-0000-0000-0000-000000000002', 'settings', FALSE, FALSE, FALSE, FALSE)
ON CONFLICT (user_id, module_name) DO NOTHING;

-- 5. Insert Categories
INSERT INTO categories (id, name, slug, icon, sort_order)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Charcoal BBQ & Grill', 'bbq-grill', 'Flame', 1),
    ('c0000000-0000-0000-0000-000000000002', 'Special Karahi & Handi', 'karahi-handi', 'UtensilsCrossed', 2),
    ('c0000000-0000-0000-0000-000000000003', 'Biryani & Pulao Rice', 'rice-biryani', 'Soup', 3),
    ('c0000000-0000-0000-0000-000000000004', 'Tandoori Breads & Naan', 'tandoor-naan', 'Wheat', 4),
    ('c0000000-0000-0000-0000-000000000005', 'Beverages & Mocktails', 'beverages', 'Coffee', 5),
    ('c0000000-0000-0000-0000-000000000006', 'Zaad Royal Desserts', 'desserts', 'Cake', 6)
ON CONFLICT (name) DO NOTHING;

-- 6. Insert Menu Items
INSERT INTO menu_items (category_id, name, description, price, cost_price, barcode, is_available)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Zaad Special Mutton Chops', 'Tender charcoal-grilled mutton chops infused with secret spices', 2150.00, 1100.00, 'ZAD-BBQ-01', TRUE),
    ('c0000000-0000-0000-0000-000000000001', 'Reshmi Chicken Tikka Boti', 'Melt-in-mouth boneless chicken boti marinated in cream & saffron', 980.00, 480.00, 'ZAD-BBQ-02', TRUE),
    ('c0000000-0000-0000-0000-000000000002', 'Desi Ghee Mutton Karahi (Full)', 'Cooked in pure organic butter and roasted tomatoes', 3450.00, 1900.00, 'ZAD-KRH-01', TRUE),
    ('c0000000-0000-0000-0000-000000000002', 'Chicken White Mughlai Handi', 'Rich cashew gravy cooked over slow flame', 1850.00, 890.00, 'ZAD-KRH-02', TRUE),
    ('c0000000-0000-0000-0000-000000000003', 'Zaad Dum Biryani Special', 'Aromatic long-grain basmati cooked with spicy mutton cuts', 890.00, 390.00, 'ZAD-RIC-01', TRUE),
    ('c0000000-0000-0000-0000-000000000004', 'Garlic Roghani Naan', 'Fresh clay oven bread brushed with garlic butter and sesame', 120.00, 40.00, 'ZAD-NAN-01', TRUE),
    ('c0000000-0000-0000-0000-000000000005', 'Fresh Mint Lemonade Cooler', 'Chilled crushed mint and lime beverage', 280.00, 70.00, 'ZAD-BEV-01', TRUE),
    ('c0000000-0000-0000-0000-000000000006', 'Shahi Gulab Jamun (2 Pcs)', 'Hot golden cottage cheese dumplings soaked in saffron syrup', 350.00, 120.00, 'ZAD-DES-01', TRUE)
ON CONFLICT (barcode) DO NOTHING;

-- 7. Insert Dining Tables
INSERT INTO dining_tables (table_number, capacity, section, status)
VALUES
    ('T-01', 4, 'Main Hall', 'AVAILABLE'),
    ('T-02', 4, 'Main Hall', 'AVAILABLE'),
    ('T-03', 6, 'Family Hall', 'AVAILABLE'),
    ('T-04', 6, 'Family Hall', 'AVAILABLE'),
    ('T-05', 8, 'VIP Lounge', 'AVAILABLE'),
    ('T-06', 2, 'Outdoor Terrace', 'AVAILABLE'),
    ('T-07', 4, 'Outdoor Terrace', 'AVAILABLE'),
    ('T-08', 10, 'Executive Dining', 'AVAILABLE')
ON CONFLICT (table_number) DO NOTHING;

-- 8. Insert Key Inventory Items
INSERT INTO inventory_items (item_name, sku, category, unit, current_stock, min_alert_threshold, unit_cost, supplier_name)
VALUES
    ('Fresh Boneless Chicken', 'RAW-CHK-01', 'Meat', 'kg', 45.50, 15.00, 680.00, 'Al-Rehman Poultry Farms'),
    ('Prime Mutton Cuts', 'RAW-MUT-01', 'Meat', 'kg', 28.00, 10.00, 1850.00, 'Khan Meat Suppliers'),
    ('Super Basmati Rice', 'GRA-RIC-01', 'Grains', 'kg', 120.00, 30.00, 320.00, 'Punjab Grains Ltd'),
    ('Pure Desi Ghee', 'DAI-GHE-01', 'Dairy', 'kg', 18.50, 5.00, 1950.00, 'Anmol Dairy Lahore'),
    ('Cooking Charcoal Lump', 'SUP-CHR-01', 'Supplies', 'bags', 35.00, 10.00, 450.00, 'Bismillah Coal Depot')
ON CONFLICT (sku) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
SELECT 
    'Database successfully initialized for Zaad Restaurant!' AS message,
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM user_permissions) AS total_permission_records,
    (SELECT COUNT(*) FROM categories) AS total_categories,
    (SELECT COUNT(*) FROM menu_items) AS total_menu_dishes,
    (SELECT COUNT(*) FROM dining_tables) AS total_tables,
    (SELECT COUNT(*) FROM inventory_items) AS total_inventory_items;
