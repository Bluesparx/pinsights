import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { addReview, getReviewsForUser } from '../db.js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.5-flash-lite';

const genAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

const MAX_PINS = 50;
const REVIEW_IMAGE_COUNT = 6;
const REVIEW_TEXT_COUNT = 6;
const IMAGE_TIMEOUT = 8000;
const PIN_TIMEOUT = 8000;

const randomSample = (items, count) => {
    if (items.length <= count) {
        return [...items];
    }

    const result = [...items];

    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result.slice(0, count);
};

const extractPinImageUrl = (pin) =>
    pin?.media?.images?.['600x']?.url ||
    pin?.media?.images?.['474x']?.url ||
    pin?.media?.images?.['236x']?.url ||
    pin?.media?.images?.orig?.url ||
    pin?.image_url ||
    null;

const extractPinText = (pin) =>
    pin?.description ||
    pin?.title ||
    pin?.alt_text ||
    pin?.rich_summary?.text ||
    '';

const fetchPinterestPins = async (accessToken) => {
    const response = await axios.get('https://api.pinterest.com/v5/pins', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        params: {
            page_size: MAX_PINS,
        },
        timeout: PIN_TIMEOUT,
    });

    return response.data?.items || [];
};

const fetchAndProcessImage = async (url) => {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: IMAGE_TIMEOUT,
        maxContentLength: 10 * 1024 * 1024,
        maxBodyLength: 10 * 1024 * 1024,
    });

    return sharp(response.data)
        .resize(600, 600, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .jpeg({
            quality: 80,
            mozjpeg: true,
        })
        .toBuffer();
};

const prepareImages = async (pins) => {
    const results = await Promise.allSettled(
        pins.map(async (pin) => ({
            buffer: await fetchAndProcessImage(pin.url),
            text: pin.text,
        }))
    );

    return results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);
};

const generateReview = async (images, pinDescriptions) => {
    const imageParts = images.map((imageBuffer) => ({
        inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType: 'image/jpeg',
        },
    }));

    const textDescriptions = pinDescriptions.length
        ? pinDescriptions.join('\n')
        : 'No textual descriptions were available for the pins.';

    const prompt = 
    `You are reviewing a user's Pinterest profile based only on the following text:
Pin text:
${textDescriptions}

Write a creative, thoughtful, cute, slightly playful review of their overall Pinterest persona and aesthetic.

Look for:
- Overall aesthetic and visual style
- Recurring interests and themes
- Personality traits suggested by the content
- Color, fashion, lifestyle, design, or mood patterns
- The kind of person their Pinterest presence makes them seem like

Do not claim sensitive personal information. Keep the tone playful and human, clearly based only on their content.

Write no more than 150 words. Do not use headings or bullet points.
`;

    const response = await genAI.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
            ...imageParts,
            {
                text: prompt,
            },
        ],
        config: {
            temperature: 0.8,
            maxOutputTokens: 300,
        },
    });

    return response.text?.trim() || '';
};

const fetchReview = async (req, res) => {
    try {
        const {
            access_token: accessToken,
            pinterest_user_id: pinterestUserId,
        } = req.user;

        if (!accessToken) {
            return res.status(400).json({
                error: 'Access token is required',
            });
        }

        if (!pinterestUserId) {
            return res.status(400).json({
                error: 'Pinterest user ID is required',
            });
        }

        const pins = await fetchPinterestPins(accessToken);

        if (!pins.length) {
            return res.status(404).json({
                error: 'No pins found for this user',
            });
        }

        const candidatePins = pins.slice(0, MAX_PINS);

        const imageCandidates = candidatePins
            .map((pin) => ({
                url: extractPinImageUrl(pin),
                text: extractPinText(pin),
            }))
            .filter((pin) => pin.url);

        const textCandidates = candidatePins
            .map(extractPinText)
            .filter(Boolean);

        const selectedImagePins = randomSample(
            imageCandidates,
            REVIEW_IMAGE_COUNT
        );

        const selectedTextPins = randomSample(
            textCandidates,
            REVIEW_TEXT_COUNT
        );

        const processedImages = await prepareImages(selectedImagePins);

        const images = processedImages.map(({ buffer }) => buffer);

        const imageTexts = processedImages
            .map(({ text }) => text)
            .filter(Boolean);

        const reviewTexts = randomSample(
            [...selectedTextPins, ...imageTexts],
            REVIEW_TEXT_COUNT
        );

        if (!images.length && !reviewTexts.length) {
            return res.status(404).json({
                error: 'No usable pin content found to generate review',
            });
        }

        const review = await generateReview(images, reviewTexts);

        if (!review) {
            return res.status(500).json({
                error: 'Failed to generate a review',
            });
        }

        const saved = await addReview(
            pinterestUserId,
            review,
            {
                pin_count: candidatePins.length,
                image_count: images.length,
            }
        );

        return res.status(200).json({
            id: saved.id,
            review,
            created_at: saved.created_at,
        });
    } catch (error) {
        console.error('Error in fetchReview:', error);

        if (error.response) {
            return res.status(error.response.status || 500).json({
                error:
                    error.response.data?.error ||
                    'Error generating review',
                details:
                    error.response.data?.message ||
                    error.message,
            });
        }

        return res.status(500).json({
            error: 'Error generating review',
            details: error.message,
        });
    }
};

export const getReviewHistory = async (req, res) => {
    try {
        const reviews = await getReviewsForUser(
            req.user.pinterest_user_id
        );

        return res.status(200).json({
            reviews,
        });
    } catch (error) {
        console.error('Error in getReviewHistory:', error);

        return res.status(500).json({
            error: 'Error fetching review history',
            details: error.message,
        });
    }
};

export default fetchReview;