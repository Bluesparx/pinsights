import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { GoogleGenAI } from "@google/genai";
import sharp from 'sharp';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});


const GEMINI_RPM = 15;
const MIN_MS_BETWEEN_REQS = Math.ceil(60_000 / GEMINI_RPM);
const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 5_000; 
const IMAGE_CONCURRENCY = 3;     

const requestTimestamps = [];

const waitForRateLimit = async () => {
    const now = Date.now();
    while (requestTimestamps.length && now - requestTimestamps[0] >= 60_000) {
        requestTimestamps.shift();
    }
    if (requestTimestamps.length >= GEMINI_RPM) {
        const waitMs = 60_000 - (now - requestTimestamps[0]) + 50; // +50 ms buffer
        await new Promise(r => setTimeout(r, waitMs));
        requestTimestamps.shift();
    }
    requestTimestamps.push(Date.now());
};


const generateImageDescription = async (imageBuffer) => {
    const base64Image = imageBuffer.toString("base64");

    const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg",
                },
            },
            {
                text: "Describe this image concisely in one sentence.",
            },
        ],
    });

    return response.text.trim();
};
const generateReviewText = async (prompt) => {
    const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
    });

    return response.text.trim();
};

const asyncPool = async (concurrency, items, fn) => {
    const results = [];
    const executing = new Set();

    for (const item of items) {
        const promise = fn(item).then(r => { results.push({ status: 'fulfilled', value: r }); })
            .catch(e => { results.push({ status: 'rejected', reason: e }); });
        executing.add(promise);
        promise.finally(() => executing.delete(promise));

        if (executing.size >= concurrency) {
            await Promise.race(executing);
        }
    }
    await Promise.all(executing);
    return results;
};

const generateImageDescriptions = async (imageUrls) => {
    const settled = await asyncPool(IMAGE_CONCURRENCY, imageUrls, async (url) => {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = await sharp(Buffer.from(response.data))
            .resize(600)
            .jpeg()
            .toBuffer();
        return generateImageDescription(imageBuffer);
    });

    return settled
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);
};


const selectRandomItems = (items, count) => {
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const extractPinImageUrl = (pin) =>
    pin?.media?.images?.['600x']?.url ||
    pin?.media?.images?.['236x']?.url ||
    pin?.image_url ||
    pin?.media?.images?.['orig']?.url ||
    null;

const extractPinText = (pin) =>
    pin?.description ||
    pin?.title ||
    pin?.alt_text ||
    pin?.link ||
    pin?.rich_summary?.text ||
    '';

const fetchReview = async (req, res) => {
    try {
        console.log("Fetching review...");
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const pinterestResponse = await axios.get('https://api.pinterest.com/v5/pins', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        const pins = pinterestResponse.data.items || [];
        if (pins.length === 0) {
            return res.status(404).json({ error: 'No pins found for this user' });
        }

        // Cap at 50 pins as per spec
        const candidate_pins = pins.slice(0, 50);

        const imageUrls = candidate_pins.map(extractPinImageUrl).filter(Boolean);
        const pinDescriptions = candidate_pins.map(extractPinText).filter(Boolean);

        let descriptions = [];

        if (imageUrls.length > 0) {
            // 6 images → 6 Gemini calls + 1 review call = 7 total
            // Well within 15 RPM; concurrency cap keeps burst polite
            const selectedImages = selectRandomItems(imageUrls, 6);
            const imageDescriptions = await generateImageDescriptions(selectedImages);
            descriptions = descriptions.concat(imageDescriptions);
        }

        // Fall back to text descriptions if image analysis yielded < 3 results
        if (descriptions.length < 3 && pinDescriptions.length > 0) {
            descriptions = descriptions.concat(selectRandomItems(pinDescriptions, 6));
        }

        if (descriptions.length === 0) {
            return res.status(404).json({ error: 'No usable pin content found to generate review' });
        }

        const prompt = `A user authorised you to evaluate their Pinterest pins and you found these descriptions. Provide a creative review about their overall persona. Descriptions: ${descriptions.join('. ')} Your review should be thoughtful and cute, not more than 150 words.`;

        const result = await generateReviewText(prompt);

        if (!result) {
            return res.status(500).json({ error: 'Failed to generate a review' });
        }

        console.log("Review generated!");
        return res.status(200).json(result);

    } catch (error) {
        console.error("Error in fetchReview:", error);

        if (error.response) {
            return res.status(error.response.status || 500).json({
                error: error.response.data?.error || 'Error generating review',
                details: error.response.data?.message || error.message,
            });
        }

        return res.status(500).json({ error: 'Error generating review', details: error.message });
    }
};

export default fetchReview;