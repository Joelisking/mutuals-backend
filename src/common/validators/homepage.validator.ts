import { body, param } from 'express-validator';

export const createSlideValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Subtitle must not exceed 500 characters'),
  body('mediaUrl')
    .trim()
    .notEmpty()
    .withMessage('Media URL is required')
    .isURL()
    .withMessage('Media URL must be a valid URL'),
  body('mediaType')
    .optional()
    .isIn(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'])
    .withMessage('Media type must be IMAGE, VIDEO, AUDIO, or DOCUMENT'),
  body('ctaLink')
    .optional()
    .trim()
    .isURL()
    .withMessage('CTA link must be a valid URL'),
  body('ctaText')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('CTA text must not exceed 100 characters'),
  body('order')
    .notEmpty()
    .withMessage('Order is required')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('active must be a boolean'),
];

export const updateSlideValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Slide ID is required')
    .isUUID()
    .withMessage('Slide ID must be a valid UUID'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Subtitle must not exceed 500 characters'),
  body('mediaUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Media URL must be a valid URL'),
  body('mediaType')
    .optional()
    .isIn(['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'])
    .withMessage('Media type must be IMAGE, VIDEO, AUDIO, or DOCUMENT'),
  body('ctaLink')
    .optional()
    .trim()
    .isURL()
    .withMessage('CTA link must be a valid URL'),
  body('ctaText')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('CTA text must not exceed 100 characters'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('active must be a boolean'),
];

export const slideIdValidator = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Slide ID is required')
    .isUUID()
    .withMessage('Slide ID must be a valid UUID'),
];

export const reorderSlidesValidator = [
  body('slideOrders')
    .isArray({ min: 1 })
    .withMessage('slideOrders must be a non-empty array'),
  body('slideOrders.*.id')
    .trim()
    .notEmpty()
    .withMessage('Each item must have an id')
    .isUUID()
    .withMessage('Each id must be a valid UUID'),
  body('slideOrders.*.order')
    .notEmpty()
    .withMessage('Each item must have an order')
    .isInt({ min: 0 })
    .withMessage('Each order must be a non-negative integer'),
];
