
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addProduct } from '@/lib/actions/admin';
import {
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Info,
    DollarSign,
    IndianRupee,
    Type,
    Layers,
    Scissors
} from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
    const router = useRouter();
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
        isNew: true,
        isSale: false
    });

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

            await addProduct(productData);
            router.push('/admin/products');
            router.refresh();
        } catch (error) {
            alert('Failed to create product. Please check console.');
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
            setFormData(prev => {
                const newData = { ...prev, [name]: value };

                // Smart Pricing: Auto-convert USD to INR if INR is empty
                if (name === 'priceUSD' && value && !prev.priceINR) {
                    newData.priceINR = (parseFloat(value) * 84).toFixed(0);
                }

                // Auto-generate handle from name
                if (name === 'name' && value && !prev.handle) {
                    newData.handle = value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
                }

                return newData;
            });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 pb-20">
            {/* Header Intelligence */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link href="/admin/products" className="p-3 bg-white border border-gray-100 rounded-xl hover:text-[#d8a4bc] hover:border-[#d8a4bc] transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">Initialize Asset</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Catalog Expansion & Market Valuation</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/products"
                        className="px-8 py-3.5 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all rounded-xl shadow-sm"
                    >
                        Void Action
                    </Link>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-3 px-10 py-3.5 bg-[#0F172A] text-[#d8a4bc] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all rounded-xl shadow-lg disabled:opacity-50 group"
                    >
                        <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {isSubmitting ? 'Protocol Executing...' : 'Commit to Catalog'}
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
                                        placeholder="GRAPHIC T-SHIRT 001"
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
                                        placeholder="graphic-t-shirt-1"
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
                                    placeholder="Define the brand story and technical specifications..."
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
                                placeholder="https://cdn.minga.com/assets/p1-main.jpg"
                            />
                            <div className="flex items-center gap-2 mt-4 p-4 bg-gray-50 rounded-xl">
                                <Info className="w-4 h-4 text-gray-300" />
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-loose">Automated image parser will identify primary and auxiliary assets for gallery rendering.</p>
                            </div>
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
                                    placeholder="E.G. 188CM WEARING SIZE LARGE"
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
                                placeholder="100% HEAVYWEIGHT COTTON\nPRE-SHRUNK FABRIC\nMADE IN INDIA"
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
                                    placeholder="45.00"
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
                                    placeholder="3500"
                                />
                                <p className="text-[8px] text-gray-400 font-bold uppercase mt-2 ml-1 opacity-60 italic">Suggested rate applied (1 USD ≈ 84 INR)</p>
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
