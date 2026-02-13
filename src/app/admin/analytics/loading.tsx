
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAnalyticsLoading() {
    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 bg-gray-200" />
                    <Skeleton className="h-3 w-48 bg-gray-100" />
                </div>
                <div className="h-14 w-48 bg-white border border-gray-100 rounded-2xl shadow-sm" />
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-40 bg-gray-100" />
                        <Skeleton className="h-3 w-64 bg-gray-50" />
                    </div>
                    <Skeleton className="h-[400px] w-full rounded-xl bg-gray-50" />
                </div>
                <div className="lg:col-span-4 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col space-y-8">
                    <Skeleton className="h-4 w-32 bg-gray-100" />
                    <div className="flex-1 flex flex-col justify-center items-center space-y-6">
                        <Skeleton className="h-48 w-48 rounded-full bg-gray-50" />
                        <div className="w-full space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between">
                                    <Skeleton className="h-2 w-24 bg-gray-100" />
                                    <Skeleton className="h-2 w-12 bg-gray-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Marketing Intelligence Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                        <div className="flex justify-between items-center">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-48 bg-gray-100" />
                                <Skeleton className="h-3 w-64 bg-gray-50" />
                            </div>
                            <Skeleton className="h-5 w-5 bg-gray-100" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-32 w-full rounded-2xl bg-gray-900" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-24 w-full rounded-2xl bg-gray-50" />
                                <Skeleton className="h-24 w-full rounded-2xl bg-gray-50" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
