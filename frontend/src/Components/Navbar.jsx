import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import logo from '../assets/logo.png';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [checked, setChecked] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (new URLSearchParams(window.location.search).has('code')) {
            setChecked(true);
            return;
        }

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
                            <img src={logo} alt="Pinsights logo" className="w-8 h-8 object-contain" />
                        </span>
                        <span className="text-lg font-display font-bold text-cream tracking-tight">Pinsights</span>
                    </Link>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link
                            to="/privacy-policy"
                            className="text-sm font-medium text-cream/70 hover:text-cream hover:bg-white/10 pixel-corners px-3 sm:px-4 py-2 transition-all duration-200"
                        >
                            <span>About</span>
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
