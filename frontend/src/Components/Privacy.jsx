import React from 'react';
import PrivacyPolicy from './Policy';
import Navbar from './Navbar';
import Footer from './Footer';

const Privacy = () => {
    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-64px)] bg-cream flex justify-center px-4 py-12">
                <div className="w-full max-w-2xl bg-white pixel-corners shadow-warm p-8 sm:p-10 border-t-4 border-mustard">
                    <h1 className="text-2xl font-display font-extrabold text-ink mb-6">Privacy Policy</h1>
                    <PrivacyPolicy />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Privacy;
