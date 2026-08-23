import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import api from '../api';
import Footer from './Footer';
import Navbar from './Navbar';
import DataDisclosure from './DataDisclosure';

const PIN_COLORS = ['bg-pinterest-red', 'bg-pinterest-black', 'bg-pinterest-gray'];

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
                    <Loader2 className="h-8 w-8 animate-spin text-pinterest-red" />
                    <div className="text-center space-y-1">
                        <p className="text-lg font-medium text-pinterest-black">Connecting…</p>
                        <p className="text-sm text-pinterest-gray">Just a second while we set up your account.</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-64px)] bg-pinterest-cream flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg">
                    <div className="flex justify-center gap-2 mb-6">
                        {PIN_COLORS.map((c, i) => (
                            <div key={i} className={`w-3 rounded-full ${c}`} style={{ height: `${18 + i * 10}px` }} />
                        ))}
                    </div>

                    <div className="bg-white rounded-3xl shadow-pin p-8 sm:p-10 text-center">
                        <h1 className="text-3xl font-extrabold text-pinterest-black mb-2 tracking-tight">
                            Pinsights
                        </h1>
                        <p className="text-pinterest-gray mb-8">
                            Let's find out your vibe in pinterest based on your saves! ^^ 
                        </p>

                        {error && (
                            <p className="text-sm text-pinterest-red bg-pinterest-red-light rounded-xl px-4 py-3 mb-6">
                                {error}
                            </p>
                        )}

                        {alreadyLoggedIn ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="inline-flex items-center gap-2 bg-pinterest-red hover:bg-pinterest-red-dark text-white font-bold py-3 px-8 rounded-full transition"
                            >
                                <Sparkles className="w-4 h-4" />
                                Go to your dashboard
                            </button>
                        ) : (
                            <button
                                onClick={handlePinterestAuth}
                                className="bg-pinterest-red hover:bg-pinterest-red-dark text-white font-bold py-3 px-8 rounded-full w-full max-w-xs transition"
                            >
                                Continue with Pinterest
                            </button>
                        )}

                        <div className="mt-10 pt-8 border-t border-pinterest-gray-light text-left">
                            <p className="text-sm text-pinterest-gray mb-4 text-center">
                               What happens when you connect?
                            </p>
                            <DataDisclosure compact />
                            <p className="text-xs text-pinterest-gray mt-6 text-center">
                                We don't keep permanent copies of your pins or run any accounts of our own: see the{' '}
                                <a href="/privacy-policy" className="text-pinterest-red font-medium hover:underline">
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
