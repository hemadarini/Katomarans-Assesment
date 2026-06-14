import express from 'express';
import { signup, login, refresh, logout, profile } from '../Controller/authController.js';
import { verifyToken } from '../MiddleWare/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/profile', verifyToken, profile);

export default router;
