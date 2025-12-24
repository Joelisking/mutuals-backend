import { Router } from 'express';
import { NewsletterController } from './newsletter.controller';
import { subscribeValidator, unsubscribeValidator } from '../../common/validators/newsletter.validator';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { newsletterLimiter } from '../../common/middleware/rate-limiter.middleware';
import { UserRole } from '../../common/types';

const router = Router();
const newsletterController = new NewsletterController();

// Public routes
router.post('/subscribe', newsletterLimiter, subscribeValidator, validate, newsletterController.subscribe);
router.post('/unsubscribe', unsubscribeValidator, validate, newsletterController.unsubscribe);

// Protected routes (Admin only)
router.get(
  '/subscribers',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  newsletterController.getAllSubscribers
);

router.get(
  '/stats',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  newsletterController.getStats
);

export default router;
