import { getSession, getUserByPinterestId } from '../db.js';
import { SESSION_COOKIE_NAME, clearCookieOptions } from '../utils/session.js';

export const requireAuth = async (req, res, next) => {
    try {
        const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];

        if (!sessionToken) {
            return res.status(401).json({ error: 'Not logged in', details: 'Please authorize with Pinterest first' });
        }

        const session = await getSession(sessionToken);
        if (!session) {
            res.clearCookie(SESSION_COOKIE_NAME, clearCookieOptions());
            return res.status(401).json({ error: 'Session expired', details: 'Please authorize with Pinterest again' });
        }

        const user = await getUserByPinterestId(session.pinterest_user_id);
        if (!user) {
            res.clearCookie(SESSION_COOKIE_NAME, clearCookieOptions());
            return res.status(401).json({ error: 'Account not found', details: 'Please authorize with Pinterest again' });
        }

        req.user = user;
        req.sessionToken = sessionToken;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export default requireAuth;
