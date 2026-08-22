import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import { GoogleGenAI } from "@google/genai";
import sharp from 'sharp';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";

const genAI = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
});

const MAX_IMAGES = 6;
const MAX_PINS = 50;

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

const fetchAndProcessImage = async (url) => {
    const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
    });

    return sharp(Buffer.from(response.data))
        .resize(600, 600, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .jpeg({
            quality: 85,
        })
        .toBuffer();
};

const generateReview = async (images, pinDescriptions) => {
    const contents = [];

    for (const imageBuffer of images) {
        contents.push({
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg",
            },
        });
    }

    const textDescriptions = pinDescriptions.length > 0
        ? pinDescriptions.join('\n')
        : 'No textual descriptions were available for the pins.';

    contents.push({
        text: `You are evaluating a user's Pinterest profile based on their pins.

Analyze the provided Pinterest images and textual pin information together.

Create a creative, thoughtful, cute, and slightly playful review of the user's overall Pinterest persona and aesthetic.

Look for:
- Overall aesthetic and visual style
- Recurring interests or themes
- Personality traits suggested by the pins
- Color, fashion, lifestyle, design, or mood patterns
- The kind of person their Pinterest presence makes them seem like

Do not claim to know sensitive personal information about the user. Keep the interpretation playful and clearly based only on their Pinterest content.

Textual pin information:
${textDescriptions}

Write the final review in no more than 150 words. Do not use headings or bullet points. Make it feel natural, personal, witty, thoughtful, and cute.`
    });

    const response = await genAI.models.generateContent({
        model: GEMINI_MODEL,
        contents,
    });

    return response.text?.trim() || '';
};

const fetchReview = async (req, res) => {
    try {
        console.log("Fetching review...");

        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({
                error: 'Access token is required'
            });
        }

        const pinterestResponse = await axios.get(
            'https://api.pinterest.com/v5/pins',
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const pins = pinterestResponse.data.items || [];

        if (pins.length === 0) {
            return res.status(404).json({
                error: 'No pins found for this user'
            });
        }

        const candidatePins = pins.slice(0, MAX_PINS);

        const imagePins = candidatePins
            .map(pin => ({
                url: extractPinImageUrl(pin),
                text: extractPinText(pin),
            }))
            .filter(pin => pin.url);

        const textDescriptions = candidatePins
            .map(extractPinText)
            .filter(Boolean);

        const selectedImagePins = selectRandomItems(
            imagePins,
            Math.min(MAX_IMAGES, imagePins.length)
        );

        const images = [];

        for (const pin of selectedImagePins) {
            try {
                const imageBuffer = await fetchAndProcessImage(pin.url);
                images.push(imageBuffer);
            } catch (error) {
                console.error("Failed to process image:", error.message);
            }
        }

        const selectedTexts = selectRandomItems(
            textDescriptions,
            Math.min(6, textDescriptions.length)
        );

        if (images.length === 0 && selectedTexts.length === 0) {
            return res.status(404).json({
                error: 'No usable pin content found to generate review'
            });
        }

        const result = await generateReview(images, selectedTexts);

        if (!result) {
            return res.status(500).json({
                error: 'Failed to generate a review'
            });
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

        return res.status(500).json({
            error: 'Error generating review',
            details: error.message
        });
    }
};

export default fetchReview;
