import React, { useEffect, useState } from 'react';
import { Coffee } from 'lucide-react';
import creatorImg from '../assets/creator.png';

const KOFI_URL = import.meta.env.VITE_KOFI_URL || 'https://ko-fi.com/';

const CreatorWidget = () => {
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        let closeTimer;
        const openTimer = window.setTimeout(() => {
            setHovered(true);
            closeTimer = window.setTimeout(() => setHovered(false), 3000);
        }, 6000);

        return () => {
            window.clearTimeout(openTimer);
            window.clearTimeout(closeTimer);
        };
    }, []);


    return (
        <a
            href={KOFI_URL}
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="fixed z-[80] bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center group"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="Support the creator on Ko-fi"
        >
            {/* text pill */}
            <span
                className={`
                    flex items-center gap-2 bg-custom-blue text-ink text-sm font-semibold
                    pixel-corners pl-4 pr-3 py-2.5 shadow-warm-lg mr-[-1.25rem]
                    transition-all duration-300 ease-out whitespace-nowrap
                    ${hovered ? 'opacity-100 translate-x-0 pr-8' : 'opacity-0 translate-x-4 pointer-events-none'}
                `}
            >
                <Coffee className="w-4 h-4 text-ink" />
                Buy me a coffee :)
            </span>

            {/* Avatar bubble */}
            <span
                className={`
                    relative flex items-center justify-center
                    w-14 h-14 sm:w-16 sm:h-16 rounded-full
                    bg-custom-yellow ring-4 ring-white shadow-warm-lg
                    transition-transform duration-300 ease-out
                    animate-floaty
                    group-hover:scale-110 group-hover:animate-none group-hover:rotate-[8deg]
                    active:scale-95
                `}
            >
                <img
                    src={creatorImg}
                    alt="Buy the creator a coffee"
                    className="w-full h-full rounded-full object-cover"
                />
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-candy-coral text-ink flex items-center justify-center ring-2 ring-white">
                    <Coffee className="w-3 h-3" />
                </span>
            </span>
        </a>
    );
};

export default CreatorWidget;
