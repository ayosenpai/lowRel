import { getAdminBlogPosts } from '@/lib/actions/blogs';
import BlogManager, { type SerializableBlogPost } from './BlogManager';

export const dynamic = 'force-dynamic';

export default async function AdminBlogsPage() {
    const posts = await getAdminBlogPosts();

    const initialPosts: SerializableBlogPost[] = posts.map((p) => ({
        ...p,
        publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">Blogs</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                        Write, curate, and order journal posts
                    </p>
                </div>
            </div>

            <BlogManager initialPosts={initialPosts} />
        </div>
    );
}
