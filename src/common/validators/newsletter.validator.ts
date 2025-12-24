import { body } from 'express-validator';

export const subscribeValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),
  body('source')
    .optional()
    .isIn(['HOMEPAGE', 'FOOTER', 'POPUP', 'EVENT'])
    .withMessage('Invalid source'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
];

export const unsubscribeValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
];
