import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    }
);

export const upsertUser = async (profile, tokens) => {
    const now = new Date().toISOString();

    const { data: existing, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('pinterest_user_id', profile.id)
        .maybeSingle();

    if (findError) {
        throw findError;
    }

    if (existing) {
        const updates = {
            username: profile.username,
            account_type: profile.account_type,
            profile_image: profile.profile_image,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || existing.refresh_token,
            token_expires_at: tokens.expires_in
                ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
                : existing.token_expires_at,
            scope: tokens.scope || existing.scope,
            last_login_at: now,
        };

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(updates)
            .eq('pinterest_user_id', profile.id)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return {
            user: updatedUser,
            isNewUser: false,
        };
    }

    const newUser = {
        pinterest_user_id: profile.id,
        username: profile.username,
        account_type: profile.account_type,
        profile_image: profile.profile_image,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || null,
        token_expires_at: tokens.expires_in
            ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
            : null,
        scope: tokens.scope || null,
        created_at: now,
        last_login_at: now,
    };

    const { data: insertedUser, error } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return {
        user: insertedUser,
        isNewUser: true,
    };
};

export const getUserByPinterestId = async (pinterestUserId) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('pinterest_user_id', pinterestUserId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data || null;
};

export const deleteUserData = async (pinterestUserId) => {
    const { error: reviewsError } = await supabase
        .from('reviews')
        .delete()
        .eq('pinterest_user_id', pinterestUserId);

    if (reviewsError) {
        throw reviewsError;
    }

    const { error: sessionsError } = await supabase
        .from('sessions')
        .delete()
        .eq('pinterest_user_id', pinterestUserId);

    if (sessionsError) {
        throw sessionsError;
    }

    const { error: usersError } = await supabase
        .from('users')
        .delete()
        .eq('pinterest_user_id', pinterestUserId);

    if (usersError) {
        throw usersError;
    }
};


export const createSession = async (
    pinterestUserId,
    sessionToken,
    ttlMs
) => {
    const { error } = await supabase
        .from('sessions')
        .insert({
            session_token: sessionToken,
            pinterest_user_id: pinterestUserId,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + ttlMs).toISOString(),
        });

    if (error) {
        throw error;
    }
};

export const getSession = async (sessionToken) => {
    const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        return null;
    }

    if (new Date(data.expires_at).getTime() < Date.now()) {
        await supabase
            .from('sessions')
            .delete()
            .eq('session_token', sessionToken);

        return null;
    }

    return data;
};

export const deleteSession = async (sessionToken) => {
    const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('session_token', sessionToken);

    if (error) {
        throw error;
    }
};


export const addReview = async (
    pinterestUserId,
    reviewText,
    meta = {}
) => {
    const review = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        pinterest_user_id: pinterestUserId,
        review_text: reviewText,
        pin_count: meta.pin_count || null,
        personality: meta.personality || null,
        created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getReviewCountSince = async (pinterestUserId, since) => {
    const { count, error } = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .eq('pinterest_user_id', pinterestUserId)
        .gte('created_at', since);

    if (error) {
        throw error;
    }

    return count || 0;
};

export const getReviewsForUser = async (pinterestUserId) => {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('pinterest_user_id', pinterestUserId)
        .order('created_at', { ascending: false });

    if (error) {
        throw error;
    }

    return data || [];
};

export default supabase;