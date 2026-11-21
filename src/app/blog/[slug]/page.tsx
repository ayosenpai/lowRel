import Header from '@/components/sections/header';
import Footer from '@/components/sections/footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getPublishedBlogPostBySlug } from '@/lib/actions/blogs';
import BlogContent from '@/components/blog/BlogContent';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPublishedBlogPostBySlug(slug);
    if (!post) return { title: 'Post not found | Low Religion' };
    return {
        title: `${post.seoTitle || post.title} | Low Religion`,
        description: post.seoDescription || post.excerpt || 'Low Religion Journal',
        openGraph: post.coverImageUrl ? { images: [post.coverImageUrl] } : undefined,
    };
}

function formatDate(value: Date | null) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPublishedBlogPostBySlug(slug);
    if (!post) notFound();

    return (
        <main className="min-h-screen bg-white text-black pt-[94px]">
            <Header variant="solid" />
            <article className="max-w-[980px] mx-auto px-5 lg:px-10 py-14 md:py-20">
                <Link href="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 hover:text-black transition-colors mb-10">
                    <ArrowLeft className="w-4 h-4" /> Back to journal
                </Link>

                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4">
                    {formatDate(post.publishedAt) || 'Journal'}
                </p>
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-6">
                    {post.title}
                </h1>
                {post.excerpt ? (
                    <p className="text-base md:text-lg text-gray-500 leading-relaxed max-w-3xl mb-10">
                        {post.excerpt}
                    </p>
                ) : null}

                {post.coverImageUrl ? (
                    <div className="mb-12 border border-black overflow-hidden bg-gray-50">
                        <img src={post.coverImageUrl} alt={post.title} className="w-full h-auto max-h-[70vh] object-cover" />
                    </div>
                ) : null}

                <BlogContent content={post.content || ''} />
            </article>
            <Footer />
        </main>
    );
}
