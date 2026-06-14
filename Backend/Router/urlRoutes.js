import express from 'express';
import { shorten, getUserUrls, deleteUrl, getUrlAnalytics } from '../Controller/urlController.js';
import { verifyToken } from '../MiddleWare/authMiddleware.js';

const router = express.Router();

// Apply auth token validation middleware to all URL management endpoints
router.use(verifyToken);

router.post('/shorten', shorten);
router.get('/', getUserUrls);
router.delete('/:id', deleteUrl);
router.get('/:id/analytics', getUrlAnalytics);


export default router;
