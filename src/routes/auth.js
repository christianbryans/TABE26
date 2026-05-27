import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Public Routes
 */
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

/**
 * Protected Routes
 */
router.get('/me', authMiddleware, AuthController.getCurrentUser);
router.post('/logout', authMiddleware, AuthController.logout);

export default router;