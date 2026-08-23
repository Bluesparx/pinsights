import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import api from '../api';
import Footer from './Footer';
import Navbar from './Navbar';
import DataDisclosure from './DataDisclosure';

const PIN_COLORS = ['bg-candy-pink', 'bg-ink', 'bg-ink/60'];

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const authorizationCode = query.get('code');

        if (authorizationCode) {
            exchangeCodeForSession(authorizationCode);
            return;
        }

        api.get('/auth/me')
            .then(() => setAlreadyLoggedIn(true))
            .catch(() => setAlreadyLoggedIn(false));
    }, []);

    const handlePinterestAuth = () => {
        const redirectUrl = import.meta.env.VITE_PINTEREST_REDIRECT_URI;
        const authorizationUrl = `https://www.pinterest.com/oauth/?client_id=${
            import.meta.env.VITE_PINTEREST_CLIENT_ID
        }&redirect_uri=${redirectUrl}&response_type=code&scope=user_accounts:read,boards:read,pins:read`;

        window.location.href = authorizationUrl;
    };

    const exchangeCodeForSession = async (authorizationCode) => {
        setLoading(true);
        try {
            const redirectUri = import.meta.env.VITE_PINTEREST_REDIRECT_URI;

            await api.post('/oauth', {
                code: authorizationCode,
                redirect_uri: redirectUri,
            });

            window.history.replaceState({}, '', '/');
            navigate('/dashboard');
        } catch (err) {
            console.error('Pinterest OAuth error:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message,
            });
            setError(
                err.response
                    ? err.response.data?.details || err.response.data?.error || 'Failed to authenticate. Please try again.'
                    : 'Network error. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-candy-pink" />
                    <div className="text-center space-y-1">
                        <p className="text-lg font-medium text-ink">Connecting…</p>
                        <p className="text-sm text-ink/60">Just a second while we set up your account.</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg">
                    <div className="flex justify-center gap-2 mb-6">
                        {PIN_COLORS.map((c, i) => (
                            <div
                                key={i}
                                className={`w-3 pixel-corners ${c} animate-floaty`}
                                style={{ height: `${18 + i * 10}px`, animationDelay: `${i * 0.2}s` }}
                            />
                        ))}
                    </div>

                    <div className="bg-white pixel-corners shadow-warm p-8 sm:p-10 text-center border-t-4 border-mustard">
                        <h1 className="text-3xl font-display font-extrabold text-ink mb-2 tracking-tight">
                            Pinsights
                        </h1>
                        <p className="text-ink/60 mb-8">
                            Let's find out your vibe in pinterest based on your saves! ^^ 
                        </p>

                        {error && (
                            <p className="text-sm text-candy-pink-dark bg-candy-pink/10 pixel-corners px-4 py-3 mb-6">
                                {error}
                            </p>
                        )}

                        {alreadyLoggedIn ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                    className="inline-flex items-center gap-2 bg-candy-pink hover:bg-candy-pink-dark hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-white font-bold py-3 px-8 pixel-corners transition-all duration-200 shadow-warm"
                            >
                                <Sparkles className="w-4 h-4" />
                                Go to your dashboard
                            </button>
                        ) : (
                            <button
                                onClick={handlePinterestAuth}
                                    className="bg-candy-pink hover:bg-candy-pink-dark hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-white font-bold py-3 px-8 pixel-corners w-full max-w-xs transition-all duration-200 shadow-warm"
                            >
                                Continue with Pinterest
                            </button>
                        )}

                        <div className="mt-10 pt-8 border-t border-cream-deep text-left">
                            <p className="text-sm text-ink/60 mb-4 text-center">
                               What happens when you connect?
                            </p>
                            <DataDisclosure compact />
                            <p className="text-xs text-ink/60 mt-6 text-center">
                                We don't keep permanent copies of your pins or run any accounts of our own: see the{' '}
                                <a href="/privacy-policy" className="text-candy-pink font-medium hover:underline">
                                    full privacy policy
                                </a>{' '}
                                for details.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Login;
