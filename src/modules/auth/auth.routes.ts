import { Router } from 'express';
import { AuthController } from './auth.controller';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator
} from '../../common/validators/auth.validator';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate } from '../../common/middleware/auth.middleware';
import { authLimiter } from '../../common/middleware/rate-limiter.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh', refreshTokenValidator, validate, authController.refreshToken);

// Protected routes
router.get('/me', authenticate, authController.getProfile);

export default router;
