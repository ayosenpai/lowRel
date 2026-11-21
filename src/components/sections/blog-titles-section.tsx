import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { getPublishedBlogPosts } from '@/lib/actions/blogs';

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export default async function BlogTitlesSection() {
  const posts = (await getPublishedBlogPosts(3)).slice(0, 3);
  if (posts.length === 0) return null;

  return (
    <section className="w-full bg-[#d8a4bc] border-t border-black text-black">
      <div className="px-5 lg:px-10 py-3 border-b border-black flex items-center justify-between gap-3">
        <h2 className="text-[11px] md:text-xs font-black uppercase tracking-[0.2em] text-black">
          Journal
        </h2>
        <Link
          href="/blog"
          className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.16em] text-black/70 hover:text-black transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 bg-black gap-[1px] border-b border-black">
        {posts.map((post, index) => {
          const href = `/blog/${post.slug}`;
          const external = isExternal(href);
          const className = "group bg-[#d8a4bc] px-4 py-4 md:px-5 md:py-5 hover:bg-[#c992ad] transition-colors";

          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/55">
                  0{index + 1}
                </p>
                <ArrowUpRight className="w-3.5 h-3.5 text-black/45 group-hover:text-black transition-colors shrink-0" />
              </div>
              <h3 className="mt-2 text-[12px] md:text-[13px] font-black uppercase tracking-[0.08em] leading-snug text-black">
                {post.title}
              </h3>
              <p className="mt-1.5 text-[10px] md:text-[11px] leading-relaxed text-black/65 line-clamp-2">
                {post.excerpt || 'Read the latest from Low Religion.'}
              </p>
            </>
          );

          return external ? (
            <a
              key={post.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {content}
            </a>
          ) : (
            <Link key={post.id} href={href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
