
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function AdminProductsLoading() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 bg-gray-200 rounded-lg" />
                    <Skeleton className="h-3 w-48 bg-gray-100 rounded-md" />
                </div>
                <Skeleton className="h-12 w-48 bg-gray-100 rounded-xl" />
            </div>

            {/* Table Area Skeleton */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-[#F1F5F9]">
                    <Skeleton className="h-10 w-64 bg-gray-50 rounded-xl border border-gray-100" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#F8FAFC] border-b border-[#F1F5F9]">
                            <tr>
                                <th className="px-8 py-5"><Skeleton className="h-3 w-32 bg-gray-200" /></th>
                                <th className="px-8 py-5"><Skeleton className="h-3 w-20 bg-gray-200" /></th>
                                <th className="px-8 py-5"><Skeleton className="h-3 w-24 bg-gray-200" /></th>
                                <th className="px-8 py-5"><Skeleton className="h-3 w-16 bg-gray-200" /></th>
                                <th className="px-8 py-5 text-right flex justify-end gap-2"><Skeleton className="h-3 w-20 bg-gray-200" /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#F1F5F9]">
                            {[...Array(6)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <Skeleton className="w-14 h-18 bg-gray-100 rounded-lg" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-40 bg-gray-100" />
                                                <Skeleton className="h-3 w-24 bg-gray-50" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Skeleton className="h-6 w-24 bg-gray-50 rounded-full" />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-20 bg-gray-100" />
                                            <Skeleton className="h-3 w-16 bg-gray-50" />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Skeleton className="h-5 w-16 bg-gray-50 rounded-md" />
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-end gap-2">
                                            <Skeleton className="h-10 w-10 bg-gray-50 rounded-lg" />
                                            <Skeleton className="h-10 w-10 bg-gray-50 rounded-lg" />
                                            <Skeleton className="h-10 w-10 bg-gray-50 rounded-lg" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
