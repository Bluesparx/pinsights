import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../api';
import Navbar from './Navbar';
import Footer from './Footer';

const ReviewResult = () => {
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const generationStarted = useRef(false);
    const navigate = useNavigate();

    const generate = async () => {
        setLoading(true);
        setError('');
        setReview('');
        try {
            const response = await api.post('/review/generate');
            setReview(response.data.review);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/');
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
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-64px)] bg-cream flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-xl">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1 text-sm font-medium text-ink/60 hover:text-ink mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to dashboard
                    </Link>
                    <div className="bg-white pixel-border-mustard pixel-corners shadow-warm overflow-hidden">

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
                                <div className="text-center py-6">
                                    <p className="text-ink font-medium mb-2">Couldn't generate a review</p>
                                    <p className="text-sm text-ink/60 mb-6">{error}</p>
                                        <button
                                            onClick={generate}
                                            className="inline-flex items-center gap-2 bg-candy-pink hover:bg-candy-pink-dark hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-white font-bold py-2.5 px-6 pixel-corners transition-all duration-200 shadow-warm"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Try again
                                    </button>
                                </div>
                            )}

                            {!loading && !error && review && (
                                <>
                                <div className="bg-ink">
                                    <h2 className="text-cream text-xl font-display font-bold text-center">Your Review</h2>
                                </div>
                                    <p className="text-ink leading-relaxed whitespace-pre-line text-lg mb-6">
                                        {review}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={generate}
                                                className="flex-1 inline-flex items-center justify-center gap-2 pixel-border-mustard-lite bg-cream-deep hover:bg-cream-deep-80 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-ink font-bold py-2.5 px-6 pixel-corners transition-all duration-200"
                                            >
                                            <RefreshCw className="w-4 h-4" />
                                            Generate another
                                        </button>
                                        <Link
                                            to="/dashboard"
                                               className="flex-1 text-center bg-candy-pink hover:text-white hover:bg-candy-pink-dark hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-white font-bold py-2.5 px-6 pixel-corners transition-all duration-200 shadow-warm"
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
        </>
    );
};

export default ReviewResult;
