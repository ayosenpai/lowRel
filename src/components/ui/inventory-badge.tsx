"use client";

import { motion } from "framer-motion";

interface InventoryBadgeProps {
    stockLevel: number;
    className?: string;
}

export default function InventoryBadge({ stockLevel, className = "" }: InventoryBadgeProps) {
    if (stockLevel >= 5) return null; // Don't show badge if stock is healthy

    const isUrgent = stockLevel <= 2;
    const badgeText = isUrgent ? `Only ${stockLevel} left` : 'Low Stock';

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isUrgent
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-orange-50 text-orange-700 border border-orange-200'
                } ${className}`}
        >
            {/* Pulse indicator for urgent stock */}
            {isUrgent && (
                <motion.span
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                />
            )}
            {badgeText}
        </motion.div>
    );
}
