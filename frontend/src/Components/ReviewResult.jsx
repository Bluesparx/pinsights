import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../api';
import Navbar from './Navbar';
import Footer from './Footer';

const ReviewResult = () => {
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
        generate();
    }, []);

    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-64px)] bg-pinterest-cream flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-xl">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-1 text-sm font-medium text-pinterest-gray hover:text-pinterest-black mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to dashboard
                    </Link>

                    <div className="bg-white rounded-3xl shadow-pin overflow-hidden">
                        <div className="bg-pinterest-red p-5">
                            <h2 className="text-white text-xl font-bold text-center">Your Pinterest Analysis</h2>
                        </div>

                        <div className="p-8">
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-pinterest-red" />
                                    <p className="text-pinterest-black font-medium">Analyzing your pins…</p>
                                    <p className="text-sm text-pinterest-gray text-center">
                                        This can take a minute while we look through your boards.
                                    </p>
                                </div>
                            )}

                            {!loading && error && (
                                <div className="text-center py-6">
                                    <p className="text-pinterest-black font-medium mb-2">Couldn't generate a review</p>
                                    <p className="text-sm text-pinterest-gray mb-6">{error}</p>
                                    <button
                                        onClick={generate}
                                        className="inline-flex items-center gap-2 bg-pinterest-red hover:bg-pinterest-red-dark text-white font-bold py-2.5 px-6 rounded-full transition"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Try again
                                    </button>
                                </div>
                            )}

                            {!loading && !error && review && (
                                <>
                                    <p className="text-pinterest-black leading-relaxed whitespace-pre-line text-lg mb-6">
                                        {review}
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={generate}
                                            className="flex-1 inline-flex items-center justify-center gap-2 border border-pinterest-gray-light hover:bg-pinterest-gray-light text-pinterest-black font-bold py-2.5 px-6 rounded-full transition"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Generate another
                                        </button>
                                        <Link
                                            to="/dashboard"
                                            className="flex-1 text-center bg-pinterest-red hover:bg-pinterest-red-dark text-white font-bold py-2.5 px-6 rounded-full transition"
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
