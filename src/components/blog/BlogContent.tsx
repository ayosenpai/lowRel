import React from 'react';

function escapeHtml(text: string) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function linkifyEscapedText(escaped: string) {
    // Only linkify http(s) URLs. Input must already be HTML-escaped.
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = urlRegex.exec(escaped)) !== null) {
        const [rawUrl] = match;
        const start = match.index;
        if (start > lastIndex) {
            parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: escaped.slice(lastIndex, start) }} />);
        }

        // Trim common trailing punctuation from URL display/href
        let url = rawUrl;
        let trailing = '';
        while (/[),.;!?]$/.test(url)) {
            trailing = url.slice(-1) + trailing;
            url = url.slice(0, -1);
        }

        if (/^https?:\/\/[^\s]+$/i.test(url)) {
            parts.push(
                <a
                    key={key++}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 decoration-black/30 hover:decoration-black transition-colors"
                >
                    {url}
                </a>
            );
        } else {
            parts.push(<span key={key++}>{rawUrl}</span>);
        }

        if (trailing) parts.push(<span key={key++}>{trailing}</span>);
        lastIndex = start + rawUrl.length;
    }

    if (lastIndex < escaped.length) {
        parts.push(<span key={key++} dangerouslySetInnerHTML={{ __html: escaped.slice(lastIndex) }} />);
    }

    return parts.length > 0 ? parts : [<span key="all" dangerouslySetInnerHTML={{ __html: escaped }} />];
}

export default function BlogContent({ content }: { content: string }) {
    const normalized = (content || '').replace(/\r\n/g, '\n').trim();
    if (!normalized) {
        return <p className="text-gray-500">No content yet.</p>;
    }

    const paragraphs = normalized.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

    return (
        <div className="space-y-5">
            {paragraphs.map((paragraph, i) => {
                const escaped = escapeHtml(paragraph).replace(/\n/g, '<br />');
                // We need to linkify but keep <br />. Do it by splitting around <br />.
                const chunks = escaped.split('<br />');
                return (
                    <p key={i} className="text-[15px] md:text-base leading-relaxed text-gray-700">
                        {chunks.map((chunk, j) => (
                            <React.Fragment key={j}>
                                {linkifyEscapedText(chunk)}
                                {j < chunks.length - 1 ? <br /> : null}
                            </React.Fragment>
                        ))}
                    </p>
                );
            })}
        </div>
    );
}
