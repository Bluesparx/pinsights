import express from 'express';
import fetchReview, { getReviewHistory } from './controllers/review.js';
import oauth from './controllers/oauth.js';
import { me, logout, deleteAccount } from './controllers/auth.js';
import requireAuth from './middleware/requireAuth.js';

const router = express.Router();

router.post('/oauth', oauth);

router.get('/auth/me', requireAuth, me);
router.post('/auth/logout', logout);
router.delete('/auth/me', requireAuth, deleteAccount);

router.post('/review/generate', requireAuth, fetchReview);
router.get('/review/history', requireAuth, getReviewHistory);

export default router;
