import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from 'sharp';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ---------------------------------------------------------------------------
// Rate-limit config (Gemini 2.0 Flash free tier: 15 RPM, 1 500 RPD)
// Paid tier is far more generous; these constants keep us safe on free tier.
// ---------------------------------------------------------------------------
const GEMINI_RPM          = 15;          // requests per minute (free tier)
const MIN_MS_BETWEEN_REQS = Math.ceil(60_000 / GEMINI_RPM); // ~4 000 ms
const MAX_RETRIES         = 3;
const BACKOFF_BASE_MS     = 5_000;       // 5 s base; doubles each retry
const IMAGE_CONCURRENCY   = 3;           // parallel image-description calls

// Simple token-bucket: track last-N request timestamps and wait if needed
const requestTimestamps = [];

const waitForRateLimit = async () => {
    const now = Date.now();
    // Drop timestamps older than 60 s
    while (requestTimestamps.length && now - requestTimestamps[0] >= 60_000) {
        requestTimestamps.shift();
    }
    if (requestTimestamps.length >= GEMINI_RPM) {
        // Must wait until the oldest timestamp is 60 s old
        const waitMs = 60_000 - (now - requestTimestamps[0]) + 50; // +50 ms buffer
        await new Promise(r => setTimeout(r, waitMs));
        requestTimestamps.shift();
    }
    requestTimestamps.push(Date.now());
};

// Wrapper: wait for slot → call → retry on 429 with exponential backoff
const callGeminiWithRetry = async (fn, retries = MAX_RETRIES) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
        await waitForRateLimit();
        try {
            return await fn();
        } catch (err) {
            const is429 = err?.status === 429 ||
                          err?.response?.status === 429 ||
                          err?.message?.includes('429') ||
                          err?.message?.toLowerCase().includes('quota');

            if (is429 && attempt < retries) {
                const delay = BACKOFF_BASE_MS * 2 ** attempt;
                console.warn(`Gemini 429 – waiting ${delay / 1000}s before retry ${attempt + 1}/${retries}`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw err;
        }
    }
};

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

const generateImageDescription = async (imageBuffer) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const base64Image = imageBuffer.toString('base64');
    const imagePart = {
        inlineData: { data: base64Image, mimeType: 'image/jpeg' },
    };
    return callGeminiWithRetry(async () => {
        const result = await model.generateContent([
            imagePart,
            "Describe this image concisely in one sentence.",
        ]);
        return result.response.text().trim();
    });
};

const generateReviewText = async (prompt) => {
    const tryModel = async (modelName) => {
        const model = genAI.getGenerativeModel({ model: modelName });
        return callGeminiWithRetry(async () => {
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        });
    };

    try {
        return await tryModel('gemini-2.0-flash');
    } catch (err) {
        console.warn(`gemini-2.0-flash failed: ${err.message} – trying gemini-1.5-flash`);
        return await tryModel('gemini-1.5-flash');
    }
};

// ---------------------------------------------------------------------------
// Concurrency-limited map (avoids slamming the API with 6 calls at once)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

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

        const imageUrls     = candidate_pins.map(extractPinImageUrl).filter(Boolean);
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