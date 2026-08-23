import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

const PinLogo = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill="#F2C230" />
        <path
            d="M12.2 4.7c-4.1 0-6.2 2.9-6.2 5.4 0 1.5.6 2.8 1.8 3.3.2.1.4 0 .4-.2l.2-.7c.1-.2 0-.3-.1-.5-.3-.4-.6-1-.6-1.8 0-2.3 1.7-4.4 4.5-4.4 2.4 0 3.8 1.5 3.8 3.5 0 2.6-1.2 4.8-2.9 4.8-.9 0-1.7-.8-1.4-1.7.3-1 .8-2.1.8-2.8 0-.7-.4-1.2-1.1-1.2-.9 0-1.6.9-1.6 2.1 0 .8.3 1.3.3 1.3s-.9 4-1.1 4.7c-.3 1.3-.1 2.9 0 3 .1.1.1.1.2 0 .1-.1 1.2-1.5 1.6-2.9l.6-2.4c.3.6 1.2 1.1 2.1 1.1 2.8 0 4.8-2.6 4.8-5.8 0-2.8-2.3-5.4-5.9-5.4z"
            fill="#2C2A54"
        />
    </svg>
);

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        api.get('/auth/me')
            .then(res => { if (!cancelled) setUser(res.data); })
            .catch(() => { if (!cancelled) setUser(null); })
            .finally(() => { if (!cancelled) setChecked(true); });
        return () => { cancelled = true; };
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            // even if this fails, send them home - the cookie may already be gone
        }
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="bg-ink sticky top-0 z-50 border-b-4 border-mustard">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                <div className="flex justify-between items-center h-16">
                    <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
                        <span className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                            <PinLogo />
                        </span>
                        <span className="text-lg font-display font-bold text-cream tracking-tight">Pinsights</span>
                    </Link>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link
                            to="/privacy-policy"
                            className="text-sm font-medium text-cream/70 hover:text-cream hover:bg-white/10 pixel-corners px-3 sm:px-4 py-2 transition-all duration-200"
                        >
                            <span className="sm:hidden">Privacy</span>
                            <span className="hidden sm:inline">Your data</span>
                        </Link>

                        {checked && user && (
                            <>
                                <Link
                                    to="/dashboard"
                                    className="text-sm font-medium text-cream hover:bg-white/10 pixel-corners px-4 py-2 transition-all duration-200"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-sm font-medium text-cream hover:bg-white/10 pixel-corners pl-2 pr-3 py-1.5 transition-all duration-200 active:scale-95"
                                >
                                    {user.profile_image ? (
                                        <img
                                            src={user.profile_image}
                                            alt={user.username}
                                            className="w-7 h-7 rounded-full object-cover ring-1 ring-mustard/70"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <span className="w-7 h-7 bg-candy-pink text-white flex items-center justify-center text-xs font-bold ring-2 ring-mustard/70">
                                            {user.username?.[0]?.toUpperCase() || '?'}
                                        </span>
                                    )}
                                    <span className="hidden sm:inline">Log out</span>
                                </button>
                            </>
                        )}

                        {checked && !user && (
                            <Link
                                to="/"
                                className="bg-candy-pink hover:bg-candy-pink-dark hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-white text-sm font-bold pixel-corners px-4 py-2 transition-all duration-200 shadow-warm"
                            >
                                Log in
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
