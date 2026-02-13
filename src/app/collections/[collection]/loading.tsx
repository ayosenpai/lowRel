
import SkeletonLoader from "@/components/ui/skeleton-loader";

export default function CollectionLoading() {
    return (
        <main className="min-h-screen bg-white text-black pt-[94px]">
            <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-10">
                {/* Header Skeleton */}
                <div className="mb-10 text-center space-y-4">
                    <div className="flex justify-center">
                        <div className="h-3 w-48 bg-gray-100 animate-pulse rounded" />
                    </div>
                    <div className="flex justify-center">
                        <div className="h-10 md:h-12 w-64 md:w-96 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="flex justify-center">
                        <div className="h-3 w-32 bg-gray-50 animate-pulse rounded" />
                    </div>
                </div>

                {/* Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-1 gap-y-10">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <SkeletonLoader variant="product-image" className="bg-gray-100" />
                            <div className="space-y-2">
                                <SkeletonLoader variant="text" className="w-3/4 h-3" />
                                <SkeletonLoader variant="text" className="w-1/4 h-3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
