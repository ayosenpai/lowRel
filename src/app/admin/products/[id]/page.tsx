
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProductById, updateProduct } from '@/lib/actions/admin';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Info,
    DollarSign,
    IndianRupee,
    Type,
    Layers,
    Scissors,
    Loader2
} from 'lucide-react';
import Link from 'next/link';

import { use } from 'react';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        handle: '',
        priceUSD: '',
        priceINR: '',
        compareAtPriceUSD: '',
        compareAtPriceINR: '',
        category: 'T-Shirts',
        fit: 'Regular',
        description: '',
        modelInfo: '',
        images: '',
        details: '',
        isNew: false,
        isSale: false
    });

    useEffect(() => {
        async function fetchProduct() {
            const product = await getProductById(id);
            if (!product) {
                alert('Product not found');
                router.push('/admin/products');
                return;
            }

            setFormData({
                name: product.name,
                handle: product.handle,
                priceUSD: (product.priceUSD / 100).toString(),
                priceINR: (product.priceINR / 100).toString(),
                compareAtPriceUSD: product.compareAtPriceUSD ? (product.compareAtPriceUSD / 100).toString() : '',
                compareAtPriceINR: product.compareAtPriceINR ? (product.compareAtPriceINR / 100).toString() : '',
                category: product.category || 'T-Shirts',
                fit: product.fit || 'Regular',
                description: product.description || '',
                modelInfo: product.modelInfo || '',
                images: product.images?.join('\n') || '',
                details: product.details?.join('\n') || '',
                isNew: product.isNew || false,
                isSale: product.isSale || false
            });
            setIsLoading(false);
        }

        fetchProduct();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const productData = {
                ...formData,
                priceUSD: parseFloat(formData.priceUSD),
                priceINR: parseFloat(formData.priceINR),
                compareAtPriceUSD: formData.compareAtPriceUSD ? parseFloat(formData.compareAtPriceUSD) : null,
                compareAtPriceINR: formData.compareAtPriceINR ? parseFloat(formData.compareAtPriceINR) : null,
                images: formData.images.split('\n').filter(url => url.trim() !== ''),
                details: formData.details.split('\n').filter(detail => detail.trim() !== '')
            };

            await updateProduct(id, productData);
            router.push('/admin/products');
            router.refresh();
        } catch (error) {
            alert('Failed to update product');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#d8a4bc]" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Synchronizing with Registry...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header Intelligence */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href="/admin/products" className="p-3 bg-white border border-gray-100 rounded-xl hover:text-[#d8a4bc] hover:border-[#d8a4bc] transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">Modify Manifest</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Editing HL_{formData.handle.toUpperCase()}</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/products"
                        className="px-8 py-3.5 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all rounded-xl shadow-sm"
                    >
                        Discard Changes
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-3 px-10 py-3.5 bg-[#0F172A] text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all rounded-xl shadow-lg disabled:opacity-50 group"
                    >
                        <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {isSubmitting ? 'Updating Core...' : 'Sync Changes'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Product Architecture */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="admin-card p-8 rounded-2xl space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                            <Type className="w-5 h-5 text-[#d8a4bc]" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Identity & Core Content</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Official Name</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold uppercase tracking-wider focus:border-[#d8a4bc] focus:bg-white transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">System Handle</label>
                                    <input
                                        name="handle"
                                        value={formData.handle}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold uppercase tracking-wider focus:border-[#d8a4bc] focus:bg-white transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Narrative Content</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold uppercase tracking-wider focus:border-[#d8a4bc] focus:bg-white transition-all outline-none resize-none leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="admin-card p-8 rounded-2xl space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-6">
                            <ImageIcon className="w-5 h-5 text-[#d8a4bc]" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Visual Assets (CDN Interface)</h2>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Resource URLs (Line Seperated)</label>
                            <textarea
                                name="images"
                                value={formData.images}
                                onChange={handleChange}
                                required
                                rows={6}
                                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-[11px] font-mono tracking-tighter focus:border-[#d8a4bc] focus:bg-white transition-all outline-none resize-none"
                            />
                        </div>
                    </div>

                    <div className="admin-card p-8 rounded-2xl space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
                            <Scissors className="w-5 h-5 text-[#d8a4bc]" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Anatomic Specifications</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Silhouette / Fit</label>
                                <select
                                    name="fit"
                                    value={formData.fit}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold uppercase tracking-wider focus:border-[#d8a4bc] focus:bg-white transition-all outline-none appearance-none"
                                >
                                    <option>Regular</option>
                                    <option>Oversized</option>
                                    <option>Boxy</option>
                                    <option>Fitted</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Reference Model Analytics</label>
                                <input
                                    name="modelInfo"
                                    value={formData.modelInfo}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold uppercase tracking-wider focus:border-[#d8a4bc] focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Feature Breakdown (Points per line)</label>
                            <textarea
                                name="details"
                                value={formData.details}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold uppercase tracking-wider focus:border-[#d8a4bc] focus:bg-white transition-all outline-none resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

                {/* Economic & Structural Logic */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="admin-card p-8 rounded-2xl space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
                            <DollarSign className="w-5 h-5 text-[#d8a4bc]" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Economic Assessment</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                    <DollarSign className="w-3 h-3 text-blue-500" /> Valuation (USD)
                                </label>
                                <input
                                    type="number"
                                    name="priceUSD"
                                    value={formData.priceUSD}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-lg font-black tracking-tighter focus:border-[#d8a4bc] focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">
                                    <IndianRupee className="w-3 h-3 text-green-500" /> Valuation (INR)
                                </label>
                                <input
                                    type="number"
                                    name="priceINR"
                                    value={formData.priceINR}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-lg font-black tracking-tighter focus:border-[#d8a4bc] focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-50 grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[8px] font-black uppercase tracking-widest text-gray-300">Compare (USD)</label>
                                <input
                                    type="number"
                                    name="compareAtPriceUSD"
                                    value={formData.compareAtPriceUSD}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg text-[10px] font-black tracking-tighter focus:border-red-200 focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[8px] font-black uppercase tracking-widest text-gray-300">Compare (INR)</label>
                                <input
                                    type="number"
                                    name="compareAtPriceINR"
                                    value={formData.compareAtPriceINR}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg text-[10px] font-black tracking-tighter focus:border-red-200 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="admin-card p-8 rounded-2xl space-y-8">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-6">
                            <Layers className="w-5 h-5 text-[#d8a4bc]" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#0F172A]">Taxonomy</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Classification Cluster</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-xl text-[11px] font-bold uppercase tracking-wider focus:border-[#d8a4bc] focus:bg-white transition-all outline-none appearance-none"
                                >
                                    <option>T-Shirts</option>
                                    <option>Hoodies</option>
                                    <option>Outerwear</option>
                                    <option>Bottoms</option>
                                    <option>Accessories</option>
                                </select>
                            </div>
                            <div className="space-y-4 pt-4">
                                <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-blue-50 hover:bg-blue-50/20 transition-all">
                                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${formData.isNew ? 'bg-[#0F172A] border-[#0F172A]' : 'border-gray-200'}`}>
                                        {formData.isNew && <Save className="w-3 h-3 text-[#d8a4bc]" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="isNew"
                                        checked={formData.isNew}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 group-hover:text-[#0F172A]">Initial Deployment</span>
                                </label>
                                <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-xl border border-transparent hover:border-red-50 hover:bg-red-50/20 transition-all">
                                    <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${formData.isSale ? 'bg-red-500 border-red-500' : 'border-gray-200'}`}>
                                        {formData.isSale && <Save className="w-3 h-3 text-white" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        name="isSale"
                                        checked={formData.isSale}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-500 group-hover:text-red-600">Liquidate Asset (Sale)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
