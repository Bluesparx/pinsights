import React from 'react';
import { Check, X } from 'lucide-react';

const willUse = [
    'Your public profile (username + avatar), just so we can say hi',
    'Your pins and boards, so Gemini can read what you save',
    'A little bit of your pin images, run through AI for the review',
];

const wontUse = [
    "We can't post, pin, or delete anything on your account",
    "We never touch messages, followers, or payment info",
    "We don't sell your data or hand it to advertisers",
];

const DataDisclosure = ({ compact = false }) => (
    <div className={compact ? 'grid sm:grid-cols-2 gap-4' : 'grid sm:grid-cols-2 gap-6'}>
        <div>
            <p className="text-sm font-bold text-pinterest-black mb-2">What we'll use</p>
            <ul className="space-y-2">
                {willUse.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-pinterest-gray">
                        <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div>
            <p className="text-sm font-bold text-pinterest-black mb-2">What we won't touch</p>
            <ul className="space-y-2">
                {wontUse.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-pinterest-gray">
                        <X className="w-4 h-4 text-pinterest-red shrink-0 mt-0.5" />
                        <span>{item}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

export default DataDisclosure;
