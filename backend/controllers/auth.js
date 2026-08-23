import { deleteSession, deleteUserData } from '../db.js';
import { SESSION_COOKIE_NAME, clearCookieOptions } from '../utils/session.js';

// Pinterest access token
export const me = async (req, res) => {
    const { user } = req;
    return res.status(200).json({
        username: user.username,
        profile_image: user.profile_image,
        account_type: user.account_type,
        member_since: user.created_at,
    });
};

export const logout = async (req, res) => {
    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
    if (sessionToken) {
        await deleteSession(sessionToken);
    }
    res.clearCookie(SESSION_COOKIE_NAME, clearCookieOptions());
    return res.status(200).json({ success: true });
};

export const deleteAccount = async (req, res) => {
    const { user } = req;

    await deleteUserData(user.pinterest_user_id);
    res.clearCookie(SESSION_COOKIE_NAME, clearCookieOptions());
    return res.status(200).json({ success: true });
};
