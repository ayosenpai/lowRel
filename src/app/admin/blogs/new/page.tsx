import BlogForm from '../BlogForm';

export const dynamic = 'force-dynamic';

export default function NewBlogPostPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F172A]">New Blog Post</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Create a journal post</p>
            </div>
            <BlogForm />
        </div>
    );
}
