'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { upsertBlogPost, type BlogPostInput } from '@/lib/actions/blogs';

export interface BlogFormValues {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImageUrl: string;
    status: 'draft' | 'published';
    publishedAt: string;
    position: number;
    seoTitle: string;
    seoDescription: string;
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .trim()
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}

function toDateTimeLocal(value: string | null | undefined) {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function BlogForm({ initial }: { initial?: Partial<BlogFormValues> & { id?: string } }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

    const [values, setValues] = useState<BlogFormValues>({
        id: initial?.id,
        title: initial?.title ?? '',
        slug: initial?.slug ?? '',
        excerpt: initial?.excerpt ?? '',
        content: initial?.content ?? '',
        coverImageUrl: initial?.coverImageUrl ?? '',
        status: (initial?.status === 'published' ? 'published' : 'draft'),
        publishedAt: toDateTimeLocal(initial?.publishedAt),
        position: Number.isFinite(Number(initial?.position)) ? Number(initial?.position) : 0,
        seoTitle: initial?.seoTitle ?? '',
        seoDescription: initial?.seoDescription ?? '',
    });

    const previewSlug = useMemo(() => slugify(values.slug || values.title || 'post'), [values.slug, values.title]);

    const set = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) => {
        setValues((prev) => ({ ...prev, [key]: value }));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const input: BlogPostInput = {
            title: values.title,
            slug: values.slug || values.title,
            excerpt: values.excerpt || null,
            content: values.content || '',
            coverImageUrl: values.coverImageUrl || null,
            status: values.status,
            publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : null,
            position: values.position,
            seoTitle: values.seoTitle || null,
            seoDescription: values.seoDescription || null,
        };

        startTransition(async () => {
            const res = await upsertBlogPost(input, values.id);
            if (!res.success) {
                setError(res.error || 'Failed to save post.');
                return;
            }
            router.push('/admin/blogs');
            router.refresh();
        });
    };

    const inputClass = "w-full px-4 py-3 bg-gray-50 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] outline-none focus:border-[#d8a4bc] focus:ring-1 focus:ring-[#d8a4bc]/30";
    const labelClass = "block text-[10px] font-black uppercase tracking-[0.16em] text-gray-500 mb-2";

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <Link href="/admin/blogs" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#0F172A]">
                    <ArrowLeft className="w-4 h-4" /> Back to blogs
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-[#1E293B] transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" /> {isPending ? 'Saving...' : 'Save post'}
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">{error}</div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                <div className="space-y-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5">
                        <div>
                            <label className={labelClass}>Title</label>
                            <input
                                className={inputClass}
                                value={values.title}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    set('title', title);
                                    if (!slugTouched) set('slug', slugify(title));
                                }}
                                placeholder="Post title"
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Slug</label>
                            <input
                                className={inputClass}
                                value={values.slug}
                                onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }}
                                placeholder="post-slug"
                            />
                            <p className="text-[11px] text-gray-400 mt-2">URL: /blog/{previewSlug || 'post'}</p>
                        </div>
                        <div>
                            <label className={labelClass}>Excerpt</label>
                            <textarea
                                className={inputClass + " min-h-[90px] resize-y"}
                                value={values.excerpt}
                                onChange={(e) => set('excerpt', e.target.value)}
                                placeholder="Short summary shown on homepage and blog index"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Content</label>
                            <textarea
                                className={inputClass + " min-h-[320px] resize-y font-mono text-[13px] leading-relaxed"}
                                value={values.content}
                                onChange={(e) => set('content', e.target.value)}
                                placeholder="Write your blog post here. Plain text is supported. Line breaks create paragraphs. http(s) links will be auto-linked on the site."
                            />
                            <p className="text-[11px] text-gray-400 mt-2">Simple mode: plain text, paragraphs, and safe auto-linked http(s) URLs.</p>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F172A]">SEO (optional)</h2>
                        <div>
                            <label className={labelClass}>SEO title</label>
                            <input className={inputClass} value={values.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} placeholder="Defaults to post title" />
                        </div>
                        <div>
                            <label className={labelClass}>SEO description</label>
                            <textarea className={inputClass + " min-h-[80px] resize-y"} value={values.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} placeholder="Defaults to excerpt" />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F172A]">Publish</h2>
                        <div>
                            <label className={labelClass}>Status</label>
                            <select className={inputClass} value={values.status} onChange={(e) => set('status', e.target.value as 'draft' | 'published')}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Published at</label>
                            <input type="datetime-local" className={inputClass} value={values.publishedAt} onChange={(e) => set('publishedAt', e.target.value)} />
                            <p className="text-[11px] text-gray-400 mt-2">Leave empty to use current time when publishing.</p>
                        </div>
                        <div>
                            <label className={labelClass}>Position</label>
                            <input type="number" min={0} className={inputClass} value={values.position} onChange={(e) => set('position', Math.max(0, Number(e.target.value || 0)))} />
                            <p className="text-[11px] text-gray-400 mt-2">Lower numbers appear first. You can also reorder in the list.</p>
                        </div>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0F172A]">Cover image</h2>
                        <div>
                            <label className={labelClass}>Cover image URL</label>
                            <input className={inputClass} value={values.coverImageUrl} onChange={(e) => set('coverImageUrl', e.target.value)} placeholder="https://..." />
                        </div>
                        {values.coverImageUrl ? (
                            <div className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-gray-50">
                                <img src={values.coverImageUrl} alt="Cover preview" className="w-full h-40 object-cover" />
                            </div>
                        ) : (
                            <p className="text-[11px] text-gray-400">Optional. Paste an image URL.</p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}
