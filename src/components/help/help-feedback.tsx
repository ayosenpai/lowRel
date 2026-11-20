'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function HelpFeedback() {
    const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);

    return (
        <section
            aria-label="Article feedback"
            className="flex flex-col gap-4 rounded-[28px] border border-gray-100 bg-gray-50/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
        >
            {answer ? (
                <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500"
                >
                    {answer === 'yes'
                        ? 'Glad this helped.'
                        : 'Thanks. If you still need a hand, contact us.'}
                </motion.p>
            ) : (
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                    Was this article helpful?
                </p>
            )}

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setAnswer('yes')}
                    aria-label="Yes, this was helpful"
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                        answer === 'yes'
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-black hover:text-black'
                    }`}
                >
                    Yes
                </button>
                <button
                    type="button"
                    onClick={() => setAnswer('no')}
                    aria-label="No, this was not helpful"
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                        answer === 'no'
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-black hover:text-black'
                    }`}
                >
                    No
                </button>
            </div>
        </section>
    );
}
