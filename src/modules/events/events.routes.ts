import { Router } from 'express';
import { EventsController } from './events.controller';
import {
  createEventValidator,
  updateEventValidator,
  eventIdValidator,
  addEventMediaValidator,
  mediaIdValidator,
} from '../../common/validators/events.validator';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { UserRole } from '../../common/types';

const router = Router();
const eventsController = new EventsController();

// Public routes
router.get('/', eventsController.getAllEvents);
router.get('/upcoming', eventsController.getUpcomingEvents);
router.get('/past', eventsController.getPastEvents);
router.get('/featured', eventsController.getFeaturedEvents);
router.get('/:id', eventIdValidator, validate, eventsController.getEventById);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  createEventValidator,
  validate,
  eventsController.createEvent
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  updateEventValidator,
  validate,
  eventsController.updateEvent
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  eventIdValidator,
  validate,
  eventsController.deleteEvent
);

router.post(
  '/:eventId/media',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  addEventMediaValidator,
  validate,
  eventsController.addEventMedia
);

router.delete(
  '/media/:mediaId',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  mediaIdValidator,
  validate,
  eventsController.deleteEventMedia
);

export default router;
