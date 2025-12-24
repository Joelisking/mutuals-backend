import { body, param } from 'express-validator';

export const createEventValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('flyerUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Flyer URL must be a valid URL'),
  body('eventDate')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Event date must be a valid date'),
  body('eventTime')
    .optional()
    .trim(),
  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('city')
    .optional()
    .trim(),
  body('country')
    .optional()
    .trim(),
  body('ticketLink')
    .optional()
    .trim()
    .isURL()
    .withMessage('Ticket link must be a valid URL'),
  body('ticketPlatform')
    .optional()
    .trim(),
  body('ticketStatus')
    .optional()
    .trim(),
  body('type')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['UPCOMING', 'PAST'])
    .withMessage('Invalid status'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

export const updateEventValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid event ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('flyerUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Flyer URL must be a valid URL'),
  body('eventDate')
    .optional()
    .isISO8601()
    .withMessage('Event date must be a valid date'),
  body('eventTime')
    .optional()
    .trim(),
  body('venue')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Venue cannot be empty'),
  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Location cannot be empty'),
  body('city')
    .optional()
    .trim(),
  body('country')
    .optional()
    .trim(),
  body('ticketLink')
    .optional()
    .trim()
    .isURL()
    .withMessage('Ticket link must be a valid URL'),
  body('ticketPlatform')
    .optional()
    .trim(),
  body('ticketStatus')
    .optional()
    .trim(),
  body('type')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['UPCOMING', 'PAST'])
    .withMessage('Invalid status'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

export const eventIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid event ID'),
];

export const addEventMediaValidator = [
  param('eventId')
    .isUUID()
    .withMessage('Invalid event ID'),
  body('mediaUrl')
    .trim()
    .notEmpty()
    .withMessage('Media URL is required')
    .isURL()
    .withMessage('Media URL must be a valid URL'),
  body('mediaType')
    .notEmpty()
    .withMessage('Media type is required')
    .isIn(['IMAGE', 'VIDEO'])
    .withMessage('Media type must be IMAGE or VIDEO'),
  body('caption')
    .optional()
    .trim(),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
];

export const mediaIdValidator = [
  param('mediaId')
    .isUUID()
    .withMessage('Invalid media ID'),
];
