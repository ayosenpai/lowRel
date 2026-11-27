// ... existing imports
import { pgTable, text, integer, boolean, timestamp, uuid, index, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const profiles = pgTable('profiles', {
    id: uuid('id').primaryKey().notNull(), // configures compatibility with Supabase Auth
    email: text('email'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    username: text('username'),
    avatarUrl: text('avatar_url'),
    role: text('role').default('user').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        emailIdx: index('email_idx').on(table.email),
        usernameLowerIdx: uniqueIndex('profiles_username_lower_idx').on(sql`lower(${table.username})`).where(sql`"username" IS NOT NULL`),
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
    totalSpend: integer('total_spend').default(0), // stored in smallest unit (paise/cents) of base currency
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
    profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'set null', onUpdate: 'no action' }),
    totalAmount: integer('total_amount').notNull(), // smallest unit (paise/cents)
    currency: text('currency').default('INR'),
    status: text('status').default('pending'), // pending, paid, failed, shipped
    paymentId: text('payment_id'), // Razorpay Payment ID
    orderId: text('razorpay_order_id'), // Razorpay Order ID
    discountCode: text('discount_code'),
    shippingAddress: jsonb('shipping_address'),
    claimTokenHash: text('claim_token_hash'),
    claimTokenExpiresAt: timestamp('claim_token_expires_at'),
    claimedAt: timestamp('claimed_at'),
    trackingCarrier: text('tracking_carrier'),
    trackingNumber: text('tracking_number'),
    trackingUrl: text('tracking_url'),
    shippedAt: timestamp('shipped_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        orderCustomerIdx: index('order_customer_idx').on(table.customerId),
        orderProfileIdx: index('order_profile_idx').on(table.profileId),
        razorpayOrderIdx: index('razorpay_order_idx').on(table.orderId),
        orderClaimTokenHashIdx: uniqueIndex('order_claim_token_hash_idx').on(table.claimTokenHash).where(sql`"claim_token_hash" IS NOT NULL`),
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
    price: integer('price').notNull(), // price at time of purchase (smallest unit)
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

// Journey Sessions: one row per browser session (lowrel_session_id cookie)
export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(), // lowrel_session_id cookie value
    visitorId: uuid('visitor_id').references(() => visitors.id),
    customerId: uuid('customer_id').references(() => customers.id),
    userId: uuid('user_id'), // Supabase auth user id (if logged in)
    landingPath: text('landing_path'), // First page seen in the session
    exitPath: text('exit_path'), // Most recent page seen
    referrer: text('referrer'),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    country: text('country'),
    region: text('region'),
    city: text('city'),
    pageViews: integer('page_views').default(0).notNull(),
    eventCount: integer('event_count').default(0).notNull(),
    startedAt: timestamp('started_at').defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
}, (table) => {
    return {
        sessionVisitorIdx: index('session_visitor_idx').on(table.visitorId),
        sessionCustomerIdx: index('session_customer_idx').on(table.customerId),
        sessionLastSeenIdx: index('session_last_seen_idx').on(table.lastSeenAt),
    };
});

// Marketing: newsletter subscribers
export const newsletterSubscribers = pgTable('newsletter_subscribers', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull().unique(),
    source: text('source').default('popup'), // popup | footer | checkout
    userId: uuid('user_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Marketing: discount coupons
export const coupons = pgTable('coupons', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull().unique(),
    description: text('description'),
    promoText: text('promo_text'),
    type: text('type').notNull().default('percent'), // percent
    value: integer('value').notNull(), // percent value, e.g. 15
    isActive: boolean('is_active').notNull().default(true),
    isPublic: boolean('is_public').notNull().default(true),
    startsAt: timestamp('starts_at'),
    expiresAt: timestamp('expires_at'),
    maxUses: integer('max_uses'),
    usedCount: integer('used_count').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        couponCodeIdx: index('coupon_code_idx').on(table.code),
    };
});

// Support: contact form messages
export const contactMessages = pgTable('contact_messages', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject'),
    message: text('message').notNull(),
    status: text('status').default('new').notNull(), // new | read | resolved
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Storefront: editable homepage layout
export const homepageSections = pgTable('homepage_sections', {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(), // hero | category-grid | product-grid | product-carousel | product-strip
    title: text('title'),
    config: jsonb('config').$type<Record<string, unknown>>().notNull(),
    position: integer('position').notNull().default(0),
    isVisible: boolean('is_visible').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        homepagePositionIdx: index('homepage_section_position_idx').on(table.position),
    };
});

// Storefront: unpublished draft of the homepage layout (single row, id = 'current').
// Only admins can read it (via the preview route) or write it.
export const homepageDraft = pgTable('homepage_draft', {
    id: text('id').primaryKey().default('current'),
    sections: jsonb('sections').$type<Record<string, unknown>[]>().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Storefront: named, reusable homepage layout slots.
export const homepageLayouts = pgTable('homepage_layouts', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    sections: jsonb('sections').$type<Record<string, unknown>[]>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        homepageLayoutNameIdx: index('homepage_layout_name_idx').on(table.name),
    };
});

// Blog posts (on-site journal)
export const blogPosts = pgTable('blog_posts', {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    excerpt: text('excerpt'),
    content: text('content').notNull().default(''),
    coverImageUrl: text('cover_image_url'),
    status: text('status').notNull().default('draft'), // draft | published
    publishedAt: timestamp('published_at'),
    position: integer('position').notNull().default(0),
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
    return {
        blogPostSlugIdx: index('blog_post_slug_idx').on(table.slug),
        blogPostStatusIdx: index('blog_post_status_idx').on(table.status),
        blogPostPositionIdx: index('blog_post_position_idx').on(table.position),
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
