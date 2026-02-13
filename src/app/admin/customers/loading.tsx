
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCustomersLoading() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48 bg-gray-200" />
                <Skeleton className="h-4 w-32 bg-gray-100" />
            </div>

            <Skeleton className="h-10 w-96 bg-gray-100 rounded-lg" />

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4"><Skeleton className="h-3 w-20 bg-gray-200" /></th>
                                <th className="px-6 py-4"><Skeleton className="h-3 w-32 bg-gray-200" /></th>
                                <th className="px-6 py-4"><Skeleton className="h-3 w-16 bg-gray-200" /></th>
                                <th className="px-6 py-4"><Skeleton className="h-3 w-24 bg-gray-200" /></th>
                                <th className="px-6 py-4"><Skeleton className="h-3 w-28 bg-gray-200" /></th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[...Array(8)].map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-40 bg-gray-100" /></td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-48 bg-gray-100" />
                                            <Skeleton className="h-3 w-32 bg-gray-50" />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><Skeleton className="h-6 w-12 bg-gray-50 rounded-full" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-4 w-16 bg-gray-100" /></td>
                                    <td className="px-6 py-4"><Skeleton className="h-3 w-32 bg-gray-100" /></td>
                                    <td className="px-6 py-4 text-right">
                                        <Skeleton className="h-9 w-24 bg-gray-50 rounded-lg ml-auto" />
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
