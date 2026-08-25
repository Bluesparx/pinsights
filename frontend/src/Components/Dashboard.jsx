import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import api from '../api';
import Navbar from './Navbar';
import Footer from './Footer';
import ReviewCard from './ReviewCard';
import ReviewModal from './ReviewModal';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notLoggedIn, setNotLoggedIn] = useState(false);
    const [activeReview, setActiveReview] = useState(null);
    const [activeOrigin, setActiveOrigin] = useState(null);
    const [activeAccent, setActiveAccent] = useState('bg-custom-pink');
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [meRes, historyRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/review/history'),
                ]);
                setUser(meRes.data);
                setReviews(historyRes.data.reviews || []);
            } catch (err) {
                if (err.response?.status === 401) {
                    setNotLoggedIn(true);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const openReview = (review, cardEl, accentClass) => {
        setActiveOrigin(cardEl ? cardEl.getBoundingClientRect() : null);
        setActiveAccent(accentClass);
        setActiveReview(review);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 items-center justify-center min-h-[70vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-candy-pink" />
                </div>
                <Footer />
            </div>
        );
    }

    if (notLoggedIn) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex flex-1 flex-col items-center justify-center min-h-[70vh] px-4 text-center gap-4 bg-custom-pink">
                    <p className="text-lg font-medium text-ink">You're not logged in yet.</p>
                    <Link
                        to="/"
                            className="bg-custom-pink hover:brightness-105 hover:-translate-y-0.5 active:scale-95 text-ink font-bold py-3 px-8 pixel-corners transition-all duration-200 shadow-warm"
                    >
                        Continue with Pinterest
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 min-h-[calc(100vh-64px)] bg-custom-pink">
                <div className="max-w-4xl mx-auto px-4 py-10">
                    {/* Welcome */}
                    <div className="bg-white-soft pixel-border-yellow pixel-corners shadow-warm p-6 sm:p-8 mb-10 flex flex-col sm:flex-row sm:items-center gap-5 sm:justify-between">
                        <div className="flex items-center gap-4">
                            {user?.profile_image ? (
                                <img
                                    src={user.profile_image}
                                    alt={user.username}
                                    className="w-14 h-14 rounded-full object-cover ring-4 ring-custom-yellow"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-14 h-14 bg-custom-pink text-ink flex items-center justify-center text-xl font-bold ring-4 ring-custom-yellow">
                                    {user?.username?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-ink/50">Welcome back,</p>
                                <p className="text-xl font-display font-bold text-ink">@{user?.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/review/new')}
                            className="inline-flex items-center justify-center gap-2 bg-custom-pink hover:brightness-103 hover:-translate-y-0.3 active:translate-y-0 active:scale-95 text-ink font-bold py-3 px-6 pixel-corners transition-all duration-200 shadow-warm whitespace-nowrap"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate a new review
                        </button>
                    </div>

                    {/* Past reviews */}
                    <h2 className="text-lg font-display font-bold text-ink mb-1">Your past reviews</h2>
                    <p className="text-sm text-ink/60 mb-6">Tap a card to read the full thing.</p>

                    {reviews.length === 0 ? (
                        <div className="bg-white-soft pixel-corners shadow-warm p-10 text-center">
                            <p className="text-ink/60 mb-4">
                                No reviews yet — generate your first one and it'll show up here.
                            </p>
                            <button
                                onClick={() => navigate('/review/new')}
                                    className="bg-custom-pink hover:brightness-103 active:scale-95 text-ink font-bold py-2.5 px-6 pixel-corners transition-all duration-200"
                            >
                                Generate my first review
                            </button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-10 py-2">
                            {reviews.map((r, i) => (
                                <ReviewCard key={r.id} review={r} index={i} onOpen={openReview} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />

            {activeReview && (
                <ReviewModal
                    review={activeReview}
                    originRect={activeOrigin}
                    accentClass={activeAccent}
                    onClose={() => setActiveReview(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;
