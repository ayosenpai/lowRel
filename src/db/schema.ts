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
    madid: text('madid'), // Mobile Advertiser ID (IDFA/AAID)
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

export const reviews = pgTable('reviews', {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: text('product_id').references(() => products.id).notNull(),
    profileId: uuid('profile_id').references(() => profiles.id).notNull(),
    rating: integer('rating').notNull(),
    title: text('title'),
    content: text('content').notNull(),
    isVerified: boolean('is_verified').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        reviewProductIdx: index('review_product_idx').on(table.productId),
        reviewProfileIdx: index('review_profile_idx').on(table.profileId),
    };
});

export const userEvents = pgTable('user_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id'), // From Supabase Auth (if applicable)
    customerId: uuid('customer_id').references(() => customers.id), // Stitched Customer Profile
    visitorId: uuid('visitor_id').references(() => visitors.id), // Stitched Visitor Profile
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
        eventVisitorIdx: index('event_visitor_idx').on(table.visitorId),
    };
});

export const visitors = pgTable('visitors', {
    id: uuid('id').primaryKey().defaultRandom(),
    profileId: uuid('profile_id').references(() => profiles.id), // Linked to registered user
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    location: jsonb('location'), // Geo-location data
    visitCount: integer('visit_count').default(1),
    consentGiven: boolean('consent_given').default(false),
    meta: jsonb('meta'), // Any extra metadata
    lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        visitorIpIdx: index('visitor_ip_idx').on(table.ipAddress),
        visitorProfileIdx: index('visitor_profile_idx').on(table.profileId),
    };
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
    orders: many(orders),
    events: many(userEvents),
}));

export const productsRelations = relations(products, ({ many }) => ({
    reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
    product: one(products, {
        fields: [reviews.productId],
        references: [products.id],
    }),
    profile: one(profiles, {
        fields: [reviews.profileId],
        references: [profiles.id],
    }),
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
    visitor: one(visitors, {
        fields: [userEvents.visitorId],
        references: [visitors.id],
    }),
}));

export const visitorsRelations = relations(visitors, ({ one, many }) => ({
    profile: one(profiles, {
        fields: [visitors.profileId],
        references: [profiles.id],
    }),
    events: many(userEvents),
}));
