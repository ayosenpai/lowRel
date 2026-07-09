
import { getAdminProducts } from '@/lib/actions/admin';
import Link from 'next/link';
import Image from 'next/image';
import SupabaseImage from '@/components/SupabaseImage';
import {
    Plus,
    Search,
    Filter,
    Tag,
    Package,
    ArrowUpRight
} from 'lucide-react';
import ProductActions from '@/components/admin/ProductActions';

export default async function AdminProductsPage() {
    const products = await getAdminProducts();

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">Product Repository</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Manage Catalog & Localized Intelligence</p>
                </div>
                <Link
                    href="/admin/products/new"
                    className="flex items-center gap-2 px-8 py-3.5 bg-[#0F172A] text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all rounded-xl shadow-lg group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Expand Collection
                </Link>
            </div>

            {/* Filters and Search - Upgraded to Premium */}
            <div className="admin-card p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-[400px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search assets by name or handle..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-[#0F172A] outline-none placeholder:text-gray-300 transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all rounded-xl">
                        <Filter className="w-3.5 h-3.5" />
                        Category
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-3 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all rounded-xl">
                        <Tag className="w-3.5 h-3.5" />
                        Status
                    </button>
                </div>
            </div>

            {/* Product Table - High Fidelity */}
            <div className="admin-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Inventory Item</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Class</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Localized Valuation</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">State</th>
                                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-sm transition-transform group-hover:scale-105">
                                                {product.images?.[0] ? (
                                                    <SupabaseImage
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Package className="w-6 h-6 m-auto text-gray-200" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black uppercase tracking-widest text-[#0F172A] mb-1">{product.name}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">HL_{product.handle.toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 border border-gray-200">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-black text-[#0F172A] tracking-tighter">${(product.priceUSD / 100).toFixed(2)}</span>
                                                <span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest">USD</span>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-50">
                                                <span className="text-[10px] font-bold text-gray-500 tracking-tighter">₹{(product.priceINR / 100).toFixed(2)}</span>
                                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">INR</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {product.isNew && (
                                                <span className="text-[8px] font-black uppercase tracking-[0.1em] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100">Genesis</span>
                                            )}
                                            {product.isSale && (
                                                <span className="text-[8px] font-black uppercase tracking-[0.1em] bg-red-50 text-red-600 px-2.5 py-1 rounded-md border border-red-100">Discounted</span>
                                            )}
                                            {!product.isNew && !product.isSale && (
                                                <span className="text-[8px] font-black uppercase tracking-[0.1em] bg-gray-50 text-gray-400 px-2.5 py-1 rounded-md border border-gray-100">Standard</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <ProductActions id={product.id} handle={product.handle} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Total Assets: {products.length}</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors">Previous</button>
                        <button className="px-4 py-2 bg-white border border-gray-200 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
