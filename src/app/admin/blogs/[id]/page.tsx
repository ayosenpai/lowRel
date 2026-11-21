import { notFound } from 'next/navigation';
import { getAdminBlogPost } from '@/lib/actions/blogs';
import BlogForm from '../BlogForm';

export const dynamic = 'force-dynamic';

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getAdminBlogPost(id);
    if (!post) notFound();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">Edit Blog Post</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Update and curate your journal post</p>
            </div>
            <BlogForm
                initial={{
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    excerpt: post.excerpt ?? '',
                    content: post.content ?? '',
                    coverImageUrl: post.coverImageUrl ?? '',
                    status: post.status === 'published' ? 'published' : 'draft',
                    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : '',
                    position: post.position ?? 0,
                    seoTitle: post.seoTitle ?? '',
                    seoDescription: post.seoDescription ?? '',
                }}
            />
        </div>
    );
}
