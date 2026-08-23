import React from 'react';
import { Check, Image, Sparkles, X } from 'lucide-react';

const willUse = [
    'Your public profile (username + avatar), just so we can say hi',
    'A little bit of your saved pins images, run through AI for the review',
];

const wontUse = [
    "We can't post, pin, or delete anything on your account",
    "We never touch messages, followers, or payment info",
    "We don't sell your data or hand it to advertisers",
];

const DataDisclosure = ({ compact = false }) => (
    <div className={compact ? 'space-y-5' : 'space-y-8'}>
        <div className="pixel-corners bg-cream px-4 py-4 sm:px-6 sm:py-5 pixel-border-mustard-lite">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center mb-4">
                <span className="text-[11px] sm:text-xs font-bold text-ink/55 text-center">
                    From your boards
                </span>

                <span className="w-12" />

                <span className="text-[11px] sm:text-xs font-bold text-candy-pink-dark text-center">
                    To your review
                </span>
            </div>

            {/* Journey */}
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5">

                <div className="flex gap-1.5 sm:gap-2">
                    {['bg-candy-pink', 'bg-candy-teal', 'bg-mustard', 'bg-candy-pink'].map((color, index) => (
                        <span
                            key={`${color}-${index}`}
                            className={`
                                w-6 h-8
                                sm:w-11 sm:h-14
                                ${index === 3 ? 'sm:hidden' : ''}
                                ${color}
                                flex items-center justify-center
                                shadow-[2px_2px_0_rgba(0,0,0,0.06)]
                            `}
                        >
                            <Image className="w-4 h-4 text-white/80" />
                        </span>
                    ))}
                </div>

                <div className="relative h-px bg-cream-deep/70">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-cream px-2">
                        <Sparkles className="sparkle-sweep w-4 h-4 text-candy-pink" />
                    </div>
                </div>

                <div className="bg-white pixel-corners pixel-border-white px-3 py-2.5 sm:px-4 sm:py-3 w-[135px] sm:w-[165px] shadow-warm">
                    <p className="text-[10px] sm:text-[11px] leading-[1.35] text-ink/60 text-center">
                        A playful mix of color,
                        cozy details, and curious
                        ideas...
                    </p>
                </div>
            </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
            <div>
                <p className="text-sm font-bold text-ink mb-2">What we'll use</p>
                <ul className="space-y-2">
                    {willUse.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-ink/60">
                            <Check className="w-4 h-4 text-candy-mint shrink-0 mt-0.5" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <p className="text-sm font-bold text-ink mb-2">What we won't touch</p>
                <ul className="space-y-2">
                    {wontUse.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-ink/60">
                            <X className="w-4 h-4 text-candy-pink shrink-0 mt-0.5" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

export default DataDisclosure;
