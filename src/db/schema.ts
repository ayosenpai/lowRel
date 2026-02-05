// ... existing imports
import { pgTable, text, integer, boolean, timestamp, uuid, index, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().notNull(), // configures compatibility with Supabase Auth
    email: text('email'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    avatarUrl: text('avatar_url'),
    role: text('role').default('user').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        emailIdx: index('email_idx').on(table.email),
    };
});

export const products = pgTable('products', {
    id: text('id').primaryKey(), // Using text IDs like in data.ts for now
    handle: text('handle').notNull(),
    name: text('name').notNull(),
    priceUSD: integer('price_usd').notNull(), // Store in cents
    priceINR: integer('price_inr').notNull(), // Store in cents
    compareAtPriceUSD: integer('compare_at_price_usd'), // cents
    compareAtPriceINR: integer('compare_at_price_inr'), // cents
    description: text('description'),
    images: text('images').array(),
    details: text('details').array(),
    fit: text('fit'),
    modelInfo: text('model_info'),
    category: text('category'),
    isNew: boolean('is_new').default(false),
    isSale: boolean('is_sale').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        handleIdx: index('handle_idx').on(table.handle),
        categoryIdx: index('category_idx').on(table.category),
        createdAtIdx: index('created_at_idx').on(table.createdAt),
    };
});

// CRM: Customers Table
export const customers = pgTable('customers', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').unique(),
    phone: text('phone'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    totalSpend: integer('total_spend').default(0), // stored in cents (base currency USD for normalization or tracking)
    ordersCount: integer('orders_count').default(0),
    lastSeenAt: timestamp('last_seen_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        customerEmailIdx: index('customer_email_idx').on(table.email),
        customerPhoneIdx: index('customer_phone_idx').on(table.phone),
    };
});

// CRM: Orders Table
export const orders = pgTable('orders', {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id').references(() => customers.id),
    totalAmount: integer('total_amount').notNull(), // cents
    currency: text('currency').default('USD'),
    status: text('status').default('pending'), // pending, paid, failed, shipped
    paymentId: text('payment_id'), // Razorpay Payment ID
    orderId: text('razorpay_order_id'), // Razorpay Order ID
    shippingAddress: jsonb('shipping_address'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        orderCustomerIdx: index('order_customer_idx').on(table.customerId),
        razorpayOrderIdx: index('razorpay_order_idx').on(table.orderId),
    };
});

// CRM: Order Items Table
export const orderItems = pgTable('order_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id').references(() => orders.id).notNull(),
    productId: text('product_id').notNull(),
    productName: text('product_name').notNull(),
    variantName: text('variant_name'), // Size, Color etc
    quantity: integer('quantity').notNull(),
    price: integer('price').notNull(), // price at time of purchase
}, (table) => {
    return {
        orderItemOrderIdx: index('order_item_order_idx').on(table.orderId),
    };
});

export const userEvents = pgTable('user_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'), // From Supabase Auth (if applicable)
    customerId: uuid('customer_id').references(() => customers.id), // Stitched Customer Profile
    sessionId: text('session_id').notNull(),
    eventType: text('event_type').notNull(), // 'page_view', 'add_to_cart', 'begin_checkout', 'purchase'
    path: text('path'),
    payload: jsonb('payload'),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => {
    return {
        sessionIdIdx: index('session_id_idx').on(table.sessionId),
        eventTypeIdx: index('event_type_idx').on(table.eventType),
        eventCustomerIdx: index('event_customer_idx').on(table.customerId),
    };
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
    orders: many(orders),
    events: many(userEvents),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
    customer: one(customers, {
        fields: [orders.customerId],
        references: [customers.id],
    }),
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
}));

export const userEventsRelations = relations(userEvents, ({ one }) => ({
    customer: one(customers, {
        fields: [userEvents.customerId],
        references: [customers.id],
    }),
}));
