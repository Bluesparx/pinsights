import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, RefreshCw, Clock3 } from 'lucide-react';
import api from '../api';
import Navbar from './Navbar';
import Footer from './Footer';

const ReviewResult = () => {
    const [review, setReview] = useState('');
    const [personality, setPersonality] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rateLimited, setRateLimited] = useState(false);
    const generationStarted = useRef(false);
    const navigate = useNavigate();

    const generate = async () => {
        setLoading(true);
        setError('');
        setRateLimited(false);
        setReview('');
        setPersonality('');
        try {
            const response = await api.post('/review/generate');
            setReview(response.data.review);
            setPersonality(response.data.personality || '');
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/');
                return;
            }
            if (err.response?.status === 429) {
                setRateLimited(true);
                setError(
                    err.response.data?.details ||
                    'You have reached your review limit for the day. Come back tomorrow for a fresh read.'
                );
                return;
            }
            setError(
                err.response?.data?.error ||
                err.response?.data?.details ||
                err.message ||
                'Unable to generate review. Please try again later.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (generationStarted.current) return;
        generationStarted.current = true;
        generate();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 min-h-[calc(100vh-64px)] bg-custom-pink flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-xl">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1 text-sm font-medium text-ink/70 hover:text-ink mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to dashboard
                    </Link>
                    <div className="bg-white-soft pixel-border-white pixel-corners shadow-warm overflow-hidden">

                        <div className="p-8">
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-candy-pink" />
                                    <p className="text-ink font-medium">Analyzing your pins…</p>
                                    <p className="text-sm text-ink/60 text-center">
                                        This can take a minute while we look through your boards.
                                    </p>
                                </div>
                            )}

                            {!loading && error && (
                                <div
                                    role="alert"
                                    className={`text-center py-6 ${rateLimited ? 'bg-custom-pink/35 px-5 pixel-corners' : ''}`}
                                >
                                    {rateLimited && (
                                        <Clock3 className="w-10 h-10 mx-auto mb-3 text-candy-pink-dark" />
                                    )}
                                    <p className="text-ink font-medium mb-2">
                                        {rateLimited ? 'You’re all caught up for today' : "Couldn't generate a review"}
                                    </p>
                                    <p className="text-sm text-ink/60 mb-6">{error}</p>
                                    {rateLimited ? (
                                        <Link
                                            to="/dashboard"
                                            className="inline-flex items-center justify-center bg-candy-pink hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-ink font-bold py-2.5 px-6 pixel-corners transition-all duration-200 shadow-warm"
                                        >
                                            Back to dashboard
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={generate}
                                            className="inline-flex items-center gap-2 bg-candy-pink hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-ink font-bold py-2.5 px-6 pixel-corners transition-all duration-200 shadow-warm"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Try again
                                        </button>
                                    )}
                                </div>
                            )}

                            {!loading && !error && review && (
                                <>
                                    {personality && (
                                        <p className="font-display text-2xl sm:text-3xl font-extrabold text-ink mb-4 leading-snug">
                                            You are a <span className="text-generated-blue">{personality}</span>
                                        </p>
                                    )}
                                    <p className="text-ink leading-relaxed whitespace-pre-line text-lg mb-6">
                                        {review}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={generate}
                                                className="flex-1 inline-flex items-center justify-center gap-2 pixel-border-yellow-lite bg-custom-yellow hover:brightness-101 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-ink font-bold py-2.5 px-6 pixel-corners transition-all duration-200"
                                            >
                                            <RefreshCw className="w-4 h-4" />
                                            Generate another
                                        </button>
                                        <Link
                                            to="/dashboard"
                                               className="flex-1 text-center bg-candy-pink hover:text-ink hover:brightness-101 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-ink font-bold py-2.5 px-6 pixel-corners transition-all duration-200 shadow-warm"
                                        >
                                            Done
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ReviewResult;
