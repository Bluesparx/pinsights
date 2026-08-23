import React from 'react';
import DataDisclosure from './DataDisclosure';

const PrivacyPolicy = () => {
    return (
        <div className="text-ink/60">
            <p className="mb-6 text-ink">
                tl/dr : we use your Pinterest saves to write you a review, and we keep a
                copy of that review (and a little account info) so you can come back and see it
                later.
            </p>

            <div className="mb-8">
                <DataDisclosure />
            </div>

            <h2 className="text-lg font-semibold text-ink mt-6 mb-2">What we store</h2>
            <p className="mb-4">
                When you connect your Pinterest account, we save a small account record so we
                don't have to ask you to log in again every visit: your Pinterest user ID,
                username, profile picture, account type, and your Pinterest access/refresh
                tokens. We also save the text of every review we generate for you, tied to that
                same account, so it can appear in your dashboard.
            </p>

            <h2 className="text-lg font-semibold text-ink mt-6 mb-2">What we don't store</h2>
            <p className="mb-4">
                We don't keep copies of your pin images or pin descriptions after a review is
                generated - they're pulled from Pinterest, summarized by the AI model, and
                discarded. We don't store passwords (we never see your Pinterest password at
                all - that only ever happens on Pinterest's own login page).
            </p>

            <h2 className="text-lg font-semibold text-ink mt-6 mb-2">How we use your information</h2>
            <p className="mb-4">
                Your access token is used only to read your pins and boards from the Pinterest
                API and to generate your review. We never post, edit, or delete anything on your
                behalf - our app only ever requests read access.
            </p>

            <h2 className="text-lg font-semibold text-ink mt-6 mb-2">Data sharing</h2>
            <p className="mb-4">
                We don't sell or rent your information. Pin images and descriptions are sent to
                Google's Gemini API purely to generate your review text, and are not retained by
                us afterward. We don't share anything with advertisers.
            </p>

            <h2 className="text-lg font-semibold text-ink mt-6 mb-2">Deleting your data</h2>
            <p className="mb-4">
                Logging out only ends your current session - your account record and past
                reviews stay saved so you can log back in and see them. If you'd rather we
                deleted everything (your account record, tokens, and every saved review),
                email us and we'll remove it. You can also revoke Pinsights' access at any time
                from{' '}
                <a
                    href="https://www.pinterest.com/settings/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="text-candy-pink hover:underline"
                >
                    pinterest.com/settings/apps
                </a>
                .
            </p>

            <h2 className="text-lg font-semibold text-ink mt-6 mb-2">Security</h2>
            <p className="mb-4">
                We take reasonable measures to protect the information we store from loss,
                theft, misuse, and unauthorized access. No method of transmission or storage is
                ever 100% secure, but we don't do anything with your data beyond what's described
                here.
            </p>

            <h2 className="text-lg font-semibold text-ink mt-6 mb-2">Changes to this policy</h2>
            <p className="mb-2">
                If this policy changes, we'll update this page - there's no separate mailing
                list or notification system to sign up for.
            </p>
        </div>
    );
};

export default PrivacyPolicy;
