import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getPublishedBlogPosts } from '@/lib/actions/blogs';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Journal | Low Religion',
    description: 'Stories, process, and notes from Low Religion.',
};

function formatDate(value: Date | null) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function BlogPage() {
    const posts = await getPublishedBlogPosts(50);

    return (
        <main className="min-h-screen bg-white text-black pt-[94px]">
            <Header variant="solid" />
            <div className="max-w-[1440px] mx-auto px-5 lg:px-10 py-14 md:py-20">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-3">Low Religion</p>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-12 md:mb-16">Journal</h1>

                {posts.length === 0 ? (
                    <div className="border border-black p-8 md:p-12 text-sm text-gray-500">
                        No posts published yet.
                    </div>
                ) : (
                    <div className="border border-black">
                        {posts.map((post, index) => (
                            <article
                                key={post.id}
                                className={`p-6 md:p-10 ${index < posts.length - 1 ? 'border-b border-black' : ''}`}
                            >
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
                                    {formatDate(post.publishedAt) || 'Journal'}
                                </p>
                                <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-4">
                                    <Link href={`/blog/${post.slug}`} className="hover:text-[#b9849f] transition-colors">
                                        {post.title}
                                    </Link>
                                </h2>
                                {post.excerpt ? (
                                    <p className="text-sm md:text-base text-gray-500 max-w-2xl leading-relaxed mb-6">{post.excerpt}</p>
                                ) : null}
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-black hover:text-gray-500 transition-colors"
                                >
                                    Read <ArrowUpRight className="w-4 h-4" />
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
