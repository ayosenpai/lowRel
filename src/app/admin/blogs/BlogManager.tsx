'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, Edit2, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { deleteBlogPost, reorderBlogPosts, setBlogPostStatus } from '@/lib/actions/blogs';

export interface SerializableBlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    coverImageUrl: string | null;
    status: string;
    publishedAt: string | null;
    position: number;
    seoTitle: string | null;
    seoDescription: string | null;
    createdAt: string;
    updatedAt: string;
}

function formatDate(value: string | null) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function BlogManager({ initialPosts }: { initialPosts: SerializableBlogPost[] }) {
    const router = useRouter();
    const [posts, setPosts] = useState(initialPosts);
    const [isPending, startTransition] = useTransition();
    const [busyId, setBusyId] = useState<string | null>(null);

    const sorted = useMemo(
        () => [...posts].sort((a, b) => a.position - b.position || +new Date(b.updatedAt) - +new Date(a.updatedAt)),
        [posts]
    );

    const persistOrder = (next: SerializableBlogPost[]) => {
        const withPos = next.map((p, i) => ({ ...p, position: i }));
        setPosts(withPos);
        startTransition(async () => {
            const res = await reorderBlogPosts(withPos.map((p) => p.id));
            if (!res.success) alert(res.error || 'Failed to reorder posts');
            router.refresh();
        });
    };

    const move = (id: string, dir: -1 | 1) => {
        const idx = sorted.findIndex((p) => p.id === id);
        const target = idx + dir;
        if (idx < 0 || target < 0 || target >= sorted.length) return;
        const next = [...sorted];
        const [item] = next.splice(idx, 1);
        next.splice(target, 0, item);
        persistOrder(next);
    };

    const onToggleStatus = (post: SerializableBlogPost) => {
        const nextStatus = post.status === 'published' ? 'draft' : 'published';
        setBusyId(post.id);
        startTransition(async () => {
            const res = await setBlogPostStatus(post.id, nextStatus);
            setBusyId(null);
            if (!res.success) {
                alert(res.error || 'Failed to update status');
                return;
            }
            setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, status: nextStatus, publishedAt: nextStatus === 'published' ? (p.publishedAt || new Date().toISOString()) : p.publishedAt } : p));
            router.refresh();
        });
    };

    const onDelete = (post: SerializableBlogPost) => {
        if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
        setBusyId(post.id);
        startTransition(async () => {
            const res = await deleteBlogPost(post.id);
            setBusyId(null);
            if (!res.success) {
                alert(res.error || 'Failed to delete post');
                return;
            }
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
            router.refresh();
        });
    };

    return (
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    {sorted.length} post{sorted.length === 1 ? '' : 's'}
                </p>
                <Link
                    href="/admin/blogs/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#1E293B] transition-colors"
                >
                    <Plus className="w-4 h-4" /> New post
                </Link>
            </div>

            {sorted.length === 0 ? (
                <div className="p-10 text-center text-sm text-gray-500">
                    No blog posts yet. Create your first post.
                </div>
            ) : (
                <div className="divide-y divide-[#E2E8F0]">
                    {sorted.map((post, index) => {
                        const busy = busyId === post.id || isPending;
                        return (
                            <div key={post.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => move(post.id, -1)}
                                        disabled={busy || index === 0}
                                        className="p-2 border border-[#E2E8F0] rounded-lg text-gray-500 hover:text-[#0F172A] disabled:opacity-30"
                                        title="Move up"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => move(post.id, 1)}
                                        disabled={busy || index === sorted.length - 1}
                                        className="p-2 border border-[#E2E8F0] rounded-lg text-gray-500 hover:text-[#0F172A] disabled:opacity-30"
                                        title="Move down"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                    <span className="w-8 text-center text-[10px] font-bold text-gray-400">{index + 1}</span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-sm font-bold text-[#0F172A] truncate">{post.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${post.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {post.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1 truncate">/blog/{post.slug}</p>
                                    {post.excerpt ? <p className="text-xs text-gray-400 mt-1 line-clamp-1">{post.excerpt}</p> : null}
                                    <p className="text-[10px] text-gray-400 mt-1">Published: {formatDate(post.publishedAt)} · Updated: {formatDate(post.updatedAt)}</p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap shrink-0">
                                    {post.status === 'published' && (
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            target="_blank"
                                            className="p-2 border border-[#E2E8F0] rounded-lg text-gray-500 hover:text-[#0F172A]"
                                            title="View"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => onToggleStatus(post)}
                                        disabled={busy}
                                        className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-600 hover:text-[#0F172A] disabled:opacity-40"
                                    >
                                        {post.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <Link
                                        href={`/admin/blogs/${post.id}`}
                                        className="p-2 border border-[#E2E8F0] rounded-lg text-gray-500 hover:text-[#0F172A]"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => onDelete(post)}
                                        disabled={busy}
                                        className="p-2 border border-red-100 rounded-lg text-red-400 hover:text-red-600 disabled:opacity-40"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
