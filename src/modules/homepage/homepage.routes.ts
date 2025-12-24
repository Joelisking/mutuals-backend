import { Router } from 'express';
import { HomepageController } from './homepage.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { UserRole } from '../../common/types';
import {
  createSlideValidator,
  updateSlideValidator,
  slideIdValidator,
  reorderSlidesValidator,
} from '../../common/validators/homepage.validator';

const router = Router();
const homepageController = new HomepageController();

// Public routes
router.get('/hero-slides/active', homepageController.getActiveSlides);

// Protected routes (Admins only)
router.get(
  '/hero-slides',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  homepageController.getAllSlides
);

router.get(
  '/hero-slides/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  slideIdValidator,
  validate,
  homepageController.getSlideById
);

router.post(
  '/hero-slides',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  createSlideValidator,
  validate,
  homepageController.createSlide
);

router.put(
  '/hero-slides/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  updateSlideValidator,
  validate,
  homepageController.updateSlide
);

router.delete(
  '/hero-slides/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  slideIdValidator,
  validate,
  homepageController.deleteSlide
);

router.post(
  '/hero-slides/reorder',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  reorderSlidesValidator,
  validate,
  homepageController.reorderSlides
);

router.patch(
  '/hero-slides/:id/toggle',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  slideIdValidator,
  validate,
  homepageController.toggleSlideStatus
);

export default router;
