import { Router } from 'express';
import { DJsController } from './djs.controller';
import {
  createDJProfileValidator,
  updateDJProfileValidator,
  createDJMixValidator,
  updateDJMixValidator,
  djIdValidator,
  djSlugValidator,
  mixIdValidator,
} from '../../common/validators/djs.validator';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { UserRole } from '../../common/types';

const router = Router();
const djsController = new DJsController();

// Public routes - DJ Profiles
router.get('/', djsController.getAllDJProfiles);
router.get('/featured', djsController.getFeaturedDJProfiles);
router.get('/slug/:slug', djSlugValidator, validate, djsController.getDJProfileBySlug);
router.get('/:id', djIdValidator, validate, djsController.getDJProfileById);

// Public routes - DJ Mixes
router.get('/:djId/mixes', djIdValidator, validate, djsController.getDJMixes);
router.get('/mixes/:mixId', mixIdValidator, validate, djsController.getMixById);

// Protected routes - DJ Profiles
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  createDJProfileValidator,
  validate,
  djsController.createDJProfile
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  updateDJProfileValidator,
  validate,
  djsController.updateDJProfile
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  djIdValidator,
  validate,
  djsController.deleteDJProfile
);

// Protected routes - DJ Mixes
router.post(
  '/mixes',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  createDJMixValidator,
  validate,
  djsController.createDJMix
);

router.put(
  '/mixes/:mixId',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  updateDJMixValidator,
  validate,
  djsController.updateDJMix
);

router.delete(
  '/mixes/:mixId',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  mixIdValidator,
  validate,
  djsController.deleteDJMix
);

export default router;
