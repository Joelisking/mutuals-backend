import { Router } from 'express';
import { MediaController } from './media.controller';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { UserRole } from '../../common/types';
import { uploadSingle } from '../../common/middleware/upload.middleware';
import { uploadLimiter } from '../../common/middleware/rate-limiter.middleware';

const router = Router();
const mediaController = new MediaController();

// All routes require authentication
router.use(authenticate);

// Upload file (Admins and Editors)
router.post(
  '/upload',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  uploadLimiter,
  uploadSingle('file'),
  mediaController.uploadFile
);

// Get all media files
router.get(
  '/',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  mediaController.getAllMediaFiles
);

// Get media file by ID
router.get(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  mediaController.getMediaFileById
);

// Delete media file
router.delete(
  '/:id',
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  mediaController.deleteMediaFile
);

export default router;
