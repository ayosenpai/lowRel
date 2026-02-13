
'use client';

import { useState } from 'react';
import { Edit, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { deleteProduct } from '@/lib/actions/admin';
import { useRouter } from 'next/navigation';

export default function ProductActions({ id, handle }: { id: string, handle: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        setIsDeleting(true);
        try {
            await deleteProduct(id);
            router.refresh();
        } catch (error) {
            alert('Failed to delete product');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex items-center justify-end gap-2 group-hover:translate-x-0 transition-transform">
            <Link
                href={`/products/${handle}`}
                target="_blank"
                className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-blue-500 hover:border-blue-100 hover:shadow-sm transition-all shadow-sm"
                title="View Live"
            >
                <ExternalLink className="w-4 h-4" />
            </Link>
            <Link
                href={`/admin/products/${id}`}
                className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-black hover:border-gray-300 hover:shadow-sm transition-all shadow-sm"
                title="Edit"
            >
                <Edit className="w-4 h-4" />
            </Link>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:shadow-sm transition-all shadow-sm disabled:opacity-50"
                title="Delete"
            >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
        </div>
    );
}
