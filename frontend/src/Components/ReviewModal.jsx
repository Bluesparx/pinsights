import React, { useEffect, useRef, useState } from 'react';
import { X, Clock, Image as ImageIcon } from 'lucide-react';

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

const ReviewModal = ({ review, originRect, accentClass, onClose }) => {
    const [visible, setVisible] = useState(false);
    const backdropRef = useRef(null);
    const closingRef = useRef(false);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') requestClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, []);

    const requestClose = () => {
        if (closingRef.current) return;
        closingRef.current = true;
        setVisible(false);
        setTimeout(onClose, 220);
    };

    const handleBackdropClick = (e) => {
        if (e.target === backdropRef.current) requestClose();
    };

    let startTransform = 'translate(0px, 0px) scale(0.85)';
    if (originRect) {
        const cardCenterX = originRect.left + originRect.width / 2;
        const cardCenterY = originRect.top + originRect.height / 2;
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const dx = cardCenterX - viewportCenterX;
        const dy = cardCenterY - viewportCenterY;
        startTransform = `translate(${dx}px, ${dy}px) scale(0.4)`;
    }

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className={`
                fixed inset-0 z-[70] flex items-center justify-center p-4
                bg-ink/50 backdrop-blur-md
                transition-opacity duration-200 ease-out
                ${visible ? 'opacity-100' : 'opacity-0'}
            `}
        >
            <div
                style={{ transform: visible ? 'translate(0px,0px) scale(1)' : startTransform }}
                className={`
                    relative w-full max-w-lg max-h-[85vh]
                    ${accentClass} pixel-border-white pixel-corners shadow-warm-lg
                    transition-all duration-200 ease-out
                    ${visible ? 'opacity-100' : 'opacity-0'}
                `}
                role="dialog"
                aria-modal="true"
            >
                <div className="relative max-h-[calc(85vh-4px)] overflow-y-auto p-6 sm:p-8">
                    <button
                        onClick={requestClose}
                        aria-label="Close"
                        className={`absolute top-4 right-4 w-9 h-9 rounded-full ${accentClass} hover:opacity-80 text-ink flex items-center justify-center transition-all duration-200 hover:rotate-90`}
                    >
                        <X className="w-4.5 h-4.5" />
                    </button>

                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-blue-70 bg-gray-50 px-3 py-1 rounded-full mb-4">
                        <ImageIcon className="w-3.5 h-3.5" />
                        Detailed Analysis
                    </span>

                    {review.personality && (
                        <p className="font-display text-2xl sm:text-3xl font-extrabold text-ink mb-4 leading-snug">
                            You are a <span className="text-generated-blue">{review.personality}</span>
                        </p>
                    )}

                    <p className="text-ink text-lg leading-relaxed whitespace-pre-line font-medium mb-6">
                        {review.review_text}
                    </p>

                    <div className={`flex items-center gap-1.5 text-sm text-ink/60 pt-4 border-t border-ink/20`}>
                        <Clock className="w-4 h-4" />
                        {timeAgo(review.created_at)}
                        {review.pin_count ? ` · based on ${review.pin_count} pins` : ''}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
