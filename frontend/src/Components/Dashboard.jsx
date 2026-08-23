import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Sparkles, Clock } from 'lucide-react';
import api from '../api';
import Navbar from './Navbar';
import Footer from './Footer';

const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString();
};

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notLoggedIn, setNotLoggedIn] = useState(false);
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

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-[70vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-pinterest-red" />
                </div>
                <Footer />
            </>
        );
    }

    if (notLoggedIn) {
        return (
            <>
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center gap-4">
                    <p className="text-lg font-medium text-pinterest-black">You're not logged in yet.</p>
                    <Link
                        to="/"
                        className="bg-pinterest-red hover:bg-pinterest-red-dark text-white font-bold py-3 px-8 rounded-full transition"
                    >
                        Continue with Pinterest
                    </Link>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-64px)] bg-pinterest-cream">
                <div className="max-w-3xl mx-auto px-4 py-10">
                    {/* Welcome banner */}
                    <div className="bg-white rounded-3xl shadow-pin p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center gap-5 sm:justify-between">
                        <div className="flex items-center gap-4">
                            {user?.profile_image ? (
                                <img
                                    src={user.profile_image}
                                    alt={user.username}
                                    className="w-14 h-14 rounded-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-pinterest-red text-white flex items-center justify-center text-xl font-bold">
                                    {user?.username?.[0]?.toUpperCase() || '?'}
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-pinterest-gray">Welcome back,</p>
                                <p className="text-xl font-bold text-pinterest-black">@{user?.username}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/review/new')}
                            className="inline-flex items-center justify-center gap-2 bg-pinterest-red hover:bg-pinterest-red-dark text-white font-bold py-3 px-6 rounded-full transition whitespace-nowrap"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate a new review
                        </button>
                    </div>

                    {/* Past reviews */}
                    <h2 className="text-lg font-bold text-pinterest-black mb-4">Your past reviews</h2>

                    {reviews.length === 0 ? (
                        <div className="bg-white rounded-3xl shadow-pin p-10 text-center">
                            <p className="text-pinterest-gray mb-4">
                                No reviews yet — generate your first one and it'll show up here.
                            </p>
                            <button
                                onClick={() => navigate('/review/new')}
                                className="bg-pinterest-red hover:bg-pinterest-red-dark text-white font-bold py-2.5 px-6 rounded-full transition"
                            >
                                Generate my first review
                            </button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {reviews.map((r) => (
                                <div
                                    key={r.id}
                                    className="bg-white rounded-2xl shadow-pin p-5 flex flex-col"
                                >
                                    <p className="text-pinterest-black text-sm leading-relaxed whitespace-pre-line line-clamp-6 mb-3">
                                        {r.review_text}
                                    </p>
                                    <div className="mt-auto flex items-center gap-1.5 text-xs text-pinterest-gray">
                                        <Clock className="w-3.5 h-3.5" />
                                        {timeAgo(r.created_at)}
                                        {r.pin_count ? ` · based on ${r.pin_count} pins` : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Dashboard;
