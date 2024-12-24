import express from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth'; // Corrected import

const router = express.Router();

// Google OAuth routes
router.get('/google', (req, res) => {
  res.redirect('/auth/google/callback');
});

router.post('/google/callback', AuthController.googleCallback);

// Token validation route (example usage of authMiddleware)
router.get('/validate', authMiddleware, AuthController.validateToken);

export default router;