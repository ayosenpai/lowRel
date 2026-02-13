
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Eye } from "lucide-react";

export default function CustomerProfileLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div>
                <div className="flex items-center gap-2 text-sm text-gray-300 mb-6">
                    <ArrowLeft size={16} />
                    <Skeleton className="h-4 w-32 bg-gray-100" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-16 h-16 rounded-full bg-gray-200" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-64 bg-gray-200" />
                            <Skeleton className="h-4 w-48 bg-gray-100" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-white px-6 py-3 rounded-xl border border-gray-100 shadow-sm space-y-2 w-32">
                                <Skeleton className="h-3 w-16 bg-gray-50 mx-auto" />
                                <Skeleton className="h-6 w-20 bg-gray-100 mx-auto" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-2">
                        <Eye size={20} className="text-gray-200" />
                        <Skeleton className="h-6 w-40 bg-gray-200" />
                    </div>
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-10 relative">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-6 items-start">
                                <Skeleton className="h-10 w-10 rounded-full bg-gray-100 shrink-0" />
                                <div className="space-y-3 flex-1">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-40 bg-gray-100" />
                                        <Skeleton className="h-3 w-24 bg-gray-50" />
                                    </div>
                                    <Skeleton className="h-3 w-full bg-gray-50" />
                                    <Skeleton className="h-10 w-full bg-gray-50/50 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar Info Skeleton */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                        <Skeleton className="h-5 w-48 bg-gray-200" />
                        <div className="space-y-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-2 w-16 bg-gray-50" />
                                    <Skeleton className="h-4 w-full bg-gray-100" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-5 w-32 bg-gray-200" />
                            <Skeleton className="h-6 w-8 bg-gray-100 rounded-full" />
                        </div>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-4 p-3 border border-gray-50 rounded-xl">
                                    <Skeleton className="h-10 w-10 rounded-lg bg-gray-100" />
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-3 w-20 bg-gray-100" />
                                            <Skeleton className="h-3 w-12 bg-gray-100" />
                                        </div>
                                        <Skeleton className="h-2 w-16 bg-gray-50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
