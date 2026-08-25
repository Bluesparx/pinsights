import React from 'react';
import PrivacyPolicy from './Policy';
import Navbar from './Navbar';
import Footer from './Footer';

const Privacy = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 min-h-[calc(100vh-64px)] bg-custom-pink flex justify-center px-4 py-12">
                <div className="w-full max-w-2xl bg-white-soft pixel-border-yellow pixel-corners shadow-warm p-8 sm:p-10">
                    <h1 className="text-2xl font-display font-extrabold text-ink mb-6">Privacy Policy</h1>
                    <PrivacyPolicy />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Privacy;
