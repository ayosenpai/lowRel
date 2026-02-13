
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, BarChart3, Package, Users } from "lucide-react";

export default function AdminLoading() {
    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 bg-gray-200 rounded-lg" />
                    <Skeleton className="h-3 w-40 bg-gray-100 rounded-md" />
                </div>
                <div className="flex gap-4">
                    <div className="h-12 w-40 bg-white border border-gray-100 rounded-xl shadow-sm" />
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-10 w-10 rounded-xl bg-gray-50" />
                            <Skeleton className="h-4 w-12 rounded-md bg-gray-50" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24 bg-gray-50" />
                            <Skeleton className="h-7 w-32 bg-gray-100" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-48 bg-gray-100" />
                        <Skeleton className="h-8 w-24 bg-gray-50" />
                    </div>
                    <Skeleton className="h-[300px] w-full rounded-xl bg-gray-50" />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-6">
                    <Skeleton className="h-5 w-40 bg-gray-100" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4 items-center">
                                <Skeleton className="h-10 w-10 rounded-lg bg-gray-50" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-3 w-full bg-gray-100" />
                                    <Skeleton className="h-2 w-2/3 bg-gray-50" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
