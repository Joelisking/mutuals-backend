import { body, param } from 'express-validator';

export const createPlaylistValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('coverArtUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Cover art URL must be a valid URL'),
  body('curatorName')
    .trim()
    .notEmpty()
    .withMessage('Curator name is required'),
  body('curatorId')
    .optional()
    .isUUID()
    .withMessage('Invalid curator ID'),
  body('platform')
    .notEmpty()
    .withMessage('Platform is required')
    .isIn(['SPOTIFY', 'APPLE_MUSIC', 'SOUNDCLOUD', 'YOUTUBE'])
    .withMessage('Invalid platform'),
  body('embedUrl')
    .trim()
    .notEmpty()
    .withMessage('Embed URL is required')
    .isURL()
    .withMessage('Embed URL must be a valid URL'),
  body('externalLink')
    .optional()
    .trim()
    .isURL()
    .withMessage('External link must be a valid URL'),
  body('seriesName')
    .optional()
    .trim(),
  body('moodDescription')
    .optional()
    .trim(),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

export const updatePlaylistValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid playlist ID'),
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
  body('coverArtUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Cover art URL must be a valid URL'),
  body('curatorName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Curator name cannot be empty'),
  body('platform')
    .optional()
    .isIn(['SPOTIFY', 'APPLE_MUSIC', 'SOUNDCLOUD', 'YOUTUBE'])
    .withMessage('Invalid platform'),
  body('embedUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Embed URL must be a valid URL'),
  body('externalLink')
    .optional()
    .trim()
    .isURL()
    .withMessage('External link must be a valid URL'),
  body('seriesName')
    .optional()
    .trim(),
  body('moodDescription')
    .optional()
    .trim(),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

export const playlistIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid playlist ID'),
];

export const platformValidator = [
  param('platform')
    .isIn(['SPOTIFY', 'APPLE_MUSIC', 'SOUNDCLOUD', 'YOUTUBE'])
    .withMessage('Invalid platform'),
];
