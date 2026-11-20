import Link from 'next/link';

type ArticleHeaderProps = {
    category: string;
    title: string;
    updated: string;
    readingTime?: string;
};

export default function ArticleHeader({
    category,
    title,
    updated,
    readingTime,
}: ArticleHeaderProps) {
    return (
        <header className="space-y-6 border-b border-gray-100 pb-8 md:pb-10">
            <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400"
            >
                <Link href="/help" className="transition-colors hover:text-black">
                    Help Center
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-500">{category}</span>
            </nav>

            <h1 className="max-w-2xl text-3xl font-black uppercase leading-[0.95] tracking-tighter md:text-5xl">
                {title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <span>Updated {updated}</span>
                {readingTime && <span>{readingTime}</span>}
                <span>Low Religion</span>
            </div>
        </header>
    );
}
