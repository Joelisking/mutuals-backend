import { body, param } from 'express-validator';

export const createDJProfileValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),
  body('bio')
    .optional()
    .trim(),
  body('photoUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Photo URL must be a valid URL'),
  body('socialLinks')
    .optional()
    .isObject()
    .withMessage('Social links must be an object'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

export const updateDJProfileValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid DJ profile ID'),
  ...createDJProfileValidator.slice(0, -1).map(validator => validator.optional()),
];

export const createDJMixValidator = [
  body('djProfileId')
    .isUUID()
    .withMessage('Invalid DJ profile ID'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),
  body('seriesNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Series number must be a positive integer'),
  body('description')
    .optional()
    .trim(),
  body('embedUrl')
    .trim()
    .notEmpty()
    .withMessage('Embed URL is required')
    .isURL()
    .withMessage('Embed URL must be a valid URL'),
  body('platform')
    .notEmpty()
    .withMessage('Platform is required')
    .isIn(['SPOTIFY', 'APPLE_MUSIC', 'SOUNDCLOUD', 'YOUTUBE'])
    .withMessage('Invalid platform'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('releaseDate')
    .optional()
    .isISO8601()
    .withMessage('Release date must be a valid date'),
];

export const updateDJMixValidator = [
  param('mixId')
    .isUUID()
    .withMessage('Invalid mix ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),
  body('seriesNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Series number must be a positive integer'),
  body('description')
    .optional()
    .trim(),
  body('embedUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Embed URL must be a valid URL'),
  body('platform')
    .optional()
    .isIn(['SPOTIFY', 'APPLE_MUSIC', 'SOUNDCLOUD', 'YOUTUBE'])
    .withMessage('Invalid platform'),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer'),
  body('releaseDate')
    .optional()
    .isISO8601()
    .withMessage('Release date must be a valid date'),
];

export const djIdValidator = [
  param('id').isUUID().withMessage('Invalid DJ profile ID'),
];

export const djSlugValidator = [
  param('slug').trim().notEmpty().withMessage('Slug is required'),
];

export const mixIdValidator = [
  param('mixId').isUUID().withMessage('Invalid mix ID'),
];
