import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';

const ACCENT_CLASSES = [
    'bg-candy-pink',
    'bg-candy-teal',
    'bg-candy-coral',
    'bg-candy-blue',
    'bg-candy-mint',
    'bg-candy-purple',
];

const tiltFromId = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash * 31 + id.charCodeAt(i)) % 1000;
    }
    // range: -6deg to 6deg
    return ((hash % 1200) / 100) - 6;
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
        <button
            type="button"
            onClick={(e) => onOpen(review, e.currentTarget, accentClass)}
            style={{ transform: `rotate(${tilt}deg)` }}
            className={`
                group relative text-left bg-cream-card pixel-border-black
                pixel-corners shadow-polaroid p-4 pb-6 w-full
                transition-all duration-300 ease-out
                hover:rotate-0 hover:scale-[1.04] hover:shadow-polaroid-hover
                focus:outline-none focus-visible:ring-2 focus-visible:ring-mustard
                cursor-pointer
            `}
        >
            <span
                className={`absolute -top-2 -right-2 w-5 h-5 pixel-corners ${accentClass} ring-4 ring-cream shadow-warm group-hover:scale-125 transition-transform duration-300`}
                aria-hidden="true"
            />

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
    );
};

export default ReviewCard;
