
"use client";

import { useState, useEffect } from "react";
import { Star, ChevronDown, Plus, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getReviews, getReviewStats, submitReview } from "@/lib/actions/reviews";
import { format } from "date-fns";

interface ProductReviewsProps {
    productId: string;
    productHandle: string;
    productName: string;
}

export default function ProductReviews({ productId, productHandle, productName }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [stats, setStats] = useState({ averageRating: 0, totalCount: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [fetchedReviews, fetchedStats] = await Promise.all([
                getReviews(productId),
                getReviewStats(productId),
            ]);
            setReviews(fetchedReviews ?? []);
            setStats(fetchedStats ?? { averageRating: 0, totalCount: 0 });
        } catch (error) {
            console.error("Failed to load reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        setIsSubmitting(true);

        const result = await submitReview({
            productId,
            productHandle,
            rating,
            title,
            content,
        });

        if (result?.success) {
            toast.success("Review submitted successfully!");
            setIsFormOpen(false);
            setTitle("");
            setContent("");
            setRating(0);
            loadData();
        } else {
            toast.error(result?.error || "Failed to submit review.");
        }
        setIsSubmitting(false);
    };

    const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
        const count = reviews.filter(r => r.rating === stars).length;
        const percentage = stats.totalCount > 0 ? (count / stats.totalCount) * 100 : 0;
        return { stars, count, percentage };
    });

    return (
        <section id="reviews" className="py-8 border-t border-pink-500 bg-white">
            <div className="max-w-[800px] mx-auto px-4">

                {/* Digital Print Tight Header */}
                <div className="flex flex-col items-center justify-center mb-6">
                    <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-black mb-3 lowrel-header text-center">
                        Product Reviews
                    </h2>

                    <div className="flex gap-[1px] mb-2 scale-90">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3.5 h-3.5 text-black stroke-[1.25px]" />
                        ))}
                    </div>

                    <p className="text-[12px] font-medium tracking-tight text-black mb-4 text-center uppercase opacity-90">
                        Be the first to write a review
                    </p>

                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="text-[10px] font-black uppercase tracking-[0.25em] border-b-[1px] border-black pb-0.5 hover:opacity-50 transition-opacity lowrel-link"
                    >
                        {isFormOpen ? 'Cancel' : 'Write a Review'}
                    </button>
                </div>

                <div className="w-full h-[0.5px] bg-gray-100 mb-8" />

                <AnimatePresence mode="wait">
                    {isFormOpen ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="max-w-[420px] mx-auto w-full"
                        >
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="flex flex-col items-center gap-3 pb-4 border-b border-gray-100">
                                    <label className="text-[9px] uppercase font-black tracking-[0.3em] text-black lowrel-header">Rating</label>
                                    <div className="flex gap-1.5">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setRating(s)}
                                                className="group outline-none"
                                            >
                                                <Star
                                                    className={`w-6 h-6 transition-all stroke-[1px] ${s <= rating ? 'fill-black text-black' : 'text-gray-300 group-hover:text-gray-500'}`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Input
                                        placeholder="Give your review a title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="h-10 text-[12px] border-black border-[1px] focus-visible:ring-0 focus-visible:border-black rounded-none shadow-none px-3 font-medium placeholder:text-gray-400"
                                        required
                                    />

                                    <Textarea
                                        placeholder="Write your comment here"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        required
                                        className="min-h-[120px] text-[12px] border-gray-200 border-[1px] focus-visible:ring-0 focus-visible:border-black rounded-none shadow-none resize-none px-3 pt-3 font-medium placeholder:text-gray-400"
                                    />

                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            placeholder="Display name"
                                            className="h-10 text-[12px] border-gray-200 border-[1px] focus-visible:ring-0 focus-visible:border-black rounded-none shadow-none px-3 font-medium placeholder:text-gray-400"
                                        />
                                        <Input
                                            type="email"
                                            placeholder="Your email address"
                                            className="h-10 text-[12px] border-gray-200 border-[1px] focus-visible:ring-0 focus-visible:border-black rounded-none shadow-none px-3 font-medium placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col items-center gap-4">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-11 bg-black text-white hover:bg-gray-800 transition-all duration-300 uppercase font-black tracking-[0.3em] text-[10px] rounded-none lowrel-header"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="text-[9px] font-black uppercase tracking-[0.3em] border-b-[1px] border-black/30 pb-0.5 hover:border-black transition-colors lowrel-link"
                                    >
                                        Cancel Review
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col lg:flex-row lg:gap-12"
                        >
                            {/* Digital Print Stats Column */}
                            {reviews.length > 0 && (
                                <div className="lg:w-[280px] mb-8 lg:mb-0 border-r border-gray-50 pr-8">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 lowrel-header">Feedback</h2>

                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-4xl font-black leading-none tracking-tighter">{stats.averageRating.toFixed(1)}</span>
                                        <div className="flex flex-col">
                                            <div className="flex text-black scale-75 origin-left">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`w-3.5 h-3.5 ${s <= Math.round(stats.averageRating) ? 'fill-black text-black' : 'text-gray-300 stroke-[1px]'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[8px] text-gray-500 uppercase tracking-[0.2em] font-black">
                                                {stats.totalCount} Reviews
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 mb-8">
                                        {ratingBreakdown.map((item) => (
                                            <div key={item.stars} className="flex items-center gap-2 group">
                                                <span className="text-[8px] font-black w-2">{item.stars}</span>
                                                <div className="flex-1 h-[2px] bg-gray-50 overflow-hidden">
                                                    <div
                                                        style={{ width: `${item.percentage}%` }}
                                                        className="h-full bg-black opacity-80"
                                                    />
                                                </div>
                                                <span className="text-[8px] text-gray-400 font-black w-6 text-right">
                                                    {item.percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => setIsFormOpen(true)}
                                        className="w-full h-10 border-black border-[1px] text-black hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-[0.25em] font-black text-[9px] flex items-center justify-center gap-2 rounded-none"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Write Review
                                    </Button>
                                </div>
                            )}

                            {/* Digital Print Review List */}
                            <div className="flex-1">
                                {reviews.length > 0 ? (
                                    <div className="space-y-10">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="flex flex-col gap-3 group">
                                                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-[1px]">
                                                            {[1, 2, 3, 4, 5].map((s) => (
                                                                <Star key={s} className={`w-2.5 h-2.5 ${s <= review.rating ? 'fill-black text-black' : 'text-gray-300 stroke-[0.75px]'}`} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black">
                                                            {review.profile?.firstName}
                                                        </span>
                                                    </div>
                                                    <span className="text-[8px] text-gray-400 uppercase font-black tracking-widest">
                                                        {format(new Date(review.createdAt), 'dd.MM.yy')}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5 pl-1">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{review.title}</h3>
                                                    <p className="text-[12px] leading-[1.4] text-gray-900 font-medium opacity-90">{review.content}</p>
                                                    <div className="flex gap-4 pt-2">
                                                        <button className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors decoration-[1px] hover:underline underline-offset-2">Helpful</button>
                                                        <button className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black transition-colors decoration-[1px] hover:underline underline-offset-2">Report</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}

