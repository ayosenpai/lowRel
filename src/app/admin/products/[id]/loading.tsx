
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";

export default function AdminProductEditLoading() {
    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-200" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64 bg-gray-200 rounded-lg" />
                        <Skeleton className="h-3 w-40 bg-gray-100 rounded-md" />
                    </div>
                </div>
                <div className="flex gap-4">
                    <Skeleton className="h-12 w-40 bg-white border border-gray-200 rounded-xl" />
                    <Skeleton className="h-12 w-48 bg-gray-900 rounded-xl" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                                <Skeleton className="h-5 w-5 bg-gray-100" />
                                <Skeleton className="h-4 w-48 bg-gray-100" />
                            </div>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <Skeleton className="h-20 w-full bg-gray-50 rounded-xl" />
                                    <Skeleton className="h-20 w-full bg-gray-50 rounded-xl" />
                                </div>
                                <Skeleton className="h-32 w-full bg-gray-50 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                                <Skeleton className="h-5 w-5 bg-gray-100" />
                                <Skeleton className="h-4 w-32 bg-gray-100" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-full bg-gray-50 rounded-lg" />
                                <Skeleton className="h-16 w-full bg-gray-50 rounded-lg" />
                                <Skeleton className="h-24 w-full bg-gray-50 rounded-lg pt-4 mt-6" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
