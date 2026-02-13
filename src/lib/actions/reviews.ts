
"use server";

import { db } from "@/db";
import { reviews, profiles, orderItems, orders, customers } from "@/db/schema";
import { eq, and, desc, avg, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getReviews(productId: string) {
    return await db.query.reviews.findMany({
        where: eq(reviews.productId, productId),
        with: {
            profile: true,
        },
        orderBy: [desc(reviews.createdAt)],
    });
}

export async function getReviewStats(productId: string) {
    const stats = await db
        .select({
            averageRating: avg(reviews.rating),
            totalCount: count(reviews.id),
        })
        .from(reviews)
        .where(eq(reviews.productId, productId));

    return {
        averageRating: parseFloat(typeof stats[0]?.averageRating === 'string' ? stats[0].averageRating : "0"),
        totalCount: stats[0]?.totalCount || 0,
    };
}

export async function submitReview(data: {
    productId: string;
    productHandle: string;
    rating: number;
    content: string;
    title?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "You must be logged in to leave a review." };
    }

    try {
        // Check if user has already reviewed this product
        const existingReview = await db.query.reviews.findFirst({
            where: and(
                eq(reviews.productId, data.productId),
                eq(reviews.profileId, user.id)
            ),
        });

        if (existingReview) {
            return { error: "You have already reviewed this product." };
        }

        let isVerified = false;

        // Simple verification check: check orders table for this user's email
        if (user.email) {
            const customerOrders = await db
                .select({ productId: orderItems.productId })
                .from(orderItems)
                .innerJoin(orders, eq(orderItems.orderId, orders.id))
                .innerJoin(customers, eq(orders.customerId, customers.id))
                .where(
                    and(
                        eq(customers.email, user.email),
                        eq(orderItems.productId, data.productId)
                    )
                )
                .limit(1);

            isVerified = customerOrders.length > 0;
        }

        await db.insert(reviews).values({
            productId: data.productId,
            profileId: user.id,
            rating: data.rating,
            title: data.title,
            content: data.content,
            isVerified,
        });

        revalidatePath(`/products/${data.productHandle}`);
        return { success: true };
    } catch (error) {
        console.error("Review submission error:", error);
        return { error: "Failed to submit review. Please try again." };
    }
}
