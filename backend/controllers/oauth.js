import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { upsertUser, createSession } from '../db.js';
import {
    SESSION_COOKIE_NAME,
    SESSION_TTL_MS,
    generateSessionToken,
    sessionCookieOptions,
} from '../utils/session.js';

const exchangeCodeForTokens = async (code, redirect_uri) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', redirect_uri);

    const clientId = process.env.PINTEREST_CLIENT_ID;
    const clientSecret = process.env.PINTEREST_CLIENT_SECRET;
    const base64Auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post('https://api.pinterest.com/v5/oauth/token', params.toString(), {
        headers: {
            Authorization: `Basic ${base64Auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data;
};

const fetchPinterestProfile = async (accessToken) => {
    const response = await axios.get('https://api.pinterest.com/v5/user_account', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data; 
};

export const oauth = async (req, res) => {
    const { code, redirect_uri } = req.body;

    if (!code || !redirect_uri) {
        return res.status(400).json({
            error: 'Missing required parameters',
            details: 'Both code and redirect_uri are required',
        });
    }

    if (!process.env.PINTEREST_CLIENT_ID || !process.env.PINTEREST_CLIENT_SECRET) {
        console.error('Missing required environment variables');
        return res.status(500).json({
            error: 'Server configuration error',
            details: 'Missing Pinterest credentials',
        });
    }

    try {
        const tokens = await exchangeCodeForTokens(code, redirect_uri);

        if (!tokens.access_token) {
            console.error('No access token in Pinterest response:', tokens);
            return res.status(500).json({
                error: 'Invalid response from Pinterest',
                details: 'No access token received',
            });
        }

        const profile = await fetchPinterestProfile(tokens.access_token);

        const { user, isNewUser } = await upsertUser(profile, tokens);

        const sessionToken = generateSessionToken();
        await createSession(user.pinterest_user_id, sessionToken, SESSION_TTL_MS);

        res.cookie(SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions());

        return res.status(200).json({
            isNewUser,
            user: {
                username: user.username,
                profile_image: user.profile_image,
                account_type: user.account_type,
            },
        });
    } catch (error) {
        console.error('Pinterest OAuth error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
        });

        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || error.response.statusText;

            switch (status) {
                case 400:
                    return res.status(400).json({ error: 'Invalid request', details: message });
                case 401:
                    return res.status(401).json({
                        error: 'Authentication failed',
                        details: 'Invalid client credentials or authorization code',
                    });
                case 403:
                    return res.status(403).json({ error: 'Access denied', details: message });
                default:
                    return res.status(status).json({ error: 'Pinterest API error', details: message });
            }
        }

        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

export default oauth;
