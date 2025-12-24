import { Router } from 'express';
import { SubmissionsController } from './submissions.controller';
import {
  contactSubmissionValidator,
  artistSubmissionValidator,
  updateSubmissionStatusValidator,
  submissionIdValidator,
} from '../../common/validators/submissions.validator';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { submissionLimiter } from '../../common/middleware/rate-limiter.middleware';
import { UserRole } from '../../common/types';

const router = Router();
const submissionsController = new SubmissionsController();

// Public routes - Contact Submissions
router.post(
  '/contact',
  submissionLimiter,
  contactSubmissionValidator,
  validate,
  submissionsController.createContactSubmission
);

// Public routes - Artist Submissions
router.post(
  '/artist',
  submissionLimiter,
  artistSubmissionValidator,
  validate,
  submissionsController.createArtistSubmission
);

// Protected routes - Contact Submissions
router.get(
  '/contact',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  submissionsController.getAllContactSubmissions
);

router.get(
  '/contact/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  submissionIdValidator,
  validate,
  submissionsController.getContactSubmissionById
);

router.patch(
  '/contact/:id/status',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  updateSubmissionStatusValidator,
  validate,
  submissionsController.updateContactSubmissionStatus
);

router.delete(
  '/contact/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  submissionIdValidator,
  validate,
  submissionsController.deleteContactSubmission
);

// Protected routes - Artist Submissions
router.get(
  '/artist',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  submissionsController.getAllArtistSubmissions
);

router.get(
  '/artist/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  submissionIdValidator,
  validate,
  submissionsController.getArtistSubmissionById
);

router.patch(
  '/artist/:id/status',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  updateSubmissionStatusValidator,
  validate,
  submissionsController.updateArtistSubmissionStatus
);

router.delete(
  '/artist/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  submissionIdValidator,
  validate,
  submissionsController.deleteArtistSubmission
);

// Stats
router.get(
  '/stats',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  submissionsController.getStats
);

export default router;
