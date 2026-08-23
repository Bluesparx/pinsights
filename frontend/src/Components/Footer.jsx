import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-cream-deep bg-white">
            <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p className="text-xs text-ink/60">
                    Pinsights is an independent app and isn't affiliated with Pinterest, Inc.
                </p>
                <p className="text-xs text-ink/60">
                    © <a href="#" className="hover:text-candy-pink">Naz</a> 2024–2026
                </p>
            </div>
        </footer>
    );
};

export default Footer;
