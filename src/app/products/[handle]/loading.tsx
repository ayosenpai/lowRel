
import SkeletonLoader from "@/components/ui/skeleton-loader";

export default function ProductLoading() {
    return (
        <main className="min-h-screen bg-white text-black pt-[94px]">
            <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
                    {/* Visual Asset Skeleton */}
                    <div className="aspect-[3/4] bg-gray-100 animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                    </div>

                    {/* Anatomy & Economic Data Skeleton */}
                    <div className="space-y-10 pt-4">
                        <div className="space-y-4">
                            <div className="h-3 w-32 bg-gray-100 animate-pulse rounded" />
                            <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                            <div className="h-6 w-24 bg-gray-100 animate-pulse rounded" />
                        </div>

                        <div className="space-y-4">
                            <div className="h-4 w-48 bg-gray-100 animate-pulse rounded" />
                            <div className="grid grid-cols-4 gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="aspect-square bg-gray-50 border border-gray-100 animate-pulse rounded-lg" />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-10 border-t border-gray-100">
                            <div className="h-14 w-full bg-black animate-pulse rounded-xl" />
                            <div className="h-14 w-full bg-white border border-gray-200 animate-pulse rounded-xl" />
                        </div>

                        <div className="space-y-6 pt-10 border-t border-gray-100">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50">
                                    <div className="h-3 w-32 bg-gray-50 animate-pulse rounded" />
                                    <div className="h-4 w-4 bg-gray-50 animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
