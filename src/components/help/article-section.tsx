import type { ReactNode } from 'react';

type ArticleSectionProps = {
    id?: string;
    title: string;
    children: ReactNode;
    className?: string;
};

export default function ArticleSection({
    id,
    title,
    children,
    className = '',
}: ArticleSectionProps) {
    return (
        <section id={id} className={`scroll-mt-28 space-y-4 ${className}`}>
            <h2 className="text-lg font-black uppercase tracking-widest md:text-xl">{title}</h2>
            <div className="space-y-4 text-[15px] leading-7 text-gray-600 md:text-base">
                {children}
            </div>
        </section>
    );
}
