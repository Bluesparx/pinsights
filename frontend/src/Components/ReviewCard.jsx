import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';

const ACCENT_CLASSES = [
    'bg-custom-matcha',
    'bg-custom-sky',
    'bg-custom-peach',
    'bg-custom-lavender',
    'bg-custom-ice',
    'bg-custom-linen',
    'bg-custom-sage',
    'bg-custom-periwinkle',
    'bg-custom-apricot',
    'bg-custom-seafoam',
    'bg-custom-banana'
];

const tiltFromId = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) % 1000;
    }
    // range: -5deg to 5deg
    return ((hash % 1200) / 100) - 5;
};

const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
};

const ReviewCard = ({ review, index, onOpen }) => {
    const tilt = useMemo(() => tiltFromId(review.id), [review.id]);
    const accentClass = ACCENT_CLASSES[index % ACCENT_CLASSES.length];

    return (
        <div
            style={{ transform: `rotate(${tilt}deg)` }}
            className={`
                group relative pixel-border-black pixel-corners shadow-polaroid p-[2px] w-full
                transition-all duration-300 ease-out
                hover:rotate-0 hover:scale-[1.04] hover:shadow-polaroid-hover
            `}
        >
            <button
                type="button"
                onClick={(e) => onOpen(review, e.currentTarget, accentClass)}
                className={`
                    group relative text-left ${accentClass} pixel-corners
                    p-4 pb-6 w-full
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-custom-yellow
                    cursor-pointer
                `}
            >
                <p className="text-ink text-sm leading-relaxed whitespace-pre-line line-clamp-6 mb-3 font-medium">
                    {review.review_text}
                </p>

                <div className="flex items-center justify-between text-xs text-ink/50">
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(review.created_at)}
                    </span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-semibold text-ink/70">
                        Read more →
                    </span>
                </div>
            </button>
        </div>
    );
};

export default ReviewCard;
