import { body, param } from 'express-validator';

export const contactSubmissionValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Subject must not exceed 500 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required'),
  body('submissionType')
    .optional()
    .isIn(['GENERAL', 'ARTIST', 'DJ', 'DESIGNER'])
    .withMessage('Invalid submission type'),
];

export const artistSubmissionValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['artist', 'dj', 'designer', 'photographer', 'stylist', 'writer', 'Artist', 'DJ', 'Designer', 'Photographer', 'Stylist', 'Writer'])
    .withMessage('Invalid role'),
  body('bio')
    .optional()
    .trim(),
  body('portfolioLinks')
    .optional()
    .isObject()
    .withMessage('Portfolio links must be an object'),
  body('socialMedia')
    .optional()
    .isObject()
    .withMessage('Social media must be an object'),
  body('pitchMessage')
    .trim()
    .notEmpty()
    .withMessage('Pitch message is required'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
];

export const updateSubmissionStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid submission ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['NEW', 'REVIEWED', 'ARCHIVED'])
    .withMessage('Invalid status'),
];

export const submissionIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid submission ID'),
];
