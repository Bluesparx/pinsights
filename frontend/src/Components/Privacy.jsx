import React from 'react';
import PrivacyPolicy from './Policy';
import Navbar from './Navbar';
import Footer from './Footer';

const Privacy = () => {
    return (
        <>
            <Navbar />
            <div className="min-h-[calc(100vh-64px)] bg-pinterest-cream flex justify-center px-4 py-12">
                <div className="w-full max-w-2xl bg-white rounded-3xl shadow-pin p-8 sm:p-10">
                    <h1 className="text-2xl font-extrabold text-pinterest-black mb-6">Privacy Policy</h1>
                    <PrivacyPolicy />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Privacy;
