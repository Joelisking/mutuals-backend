import { body, param, query } from 'express-validator';

export const sessionIdValidator = [
  query('sessionId')
    .trim()
    .notEmpty()
    .withMessage('Session ID is required')
    .isLength({ max: 255 })
    .withMessage('Session ID must not exceed 255 characters'),
];

export const addItemValidator = [
  body('sessionId')
    .trim()
    .notEmpty()
    .withMessage('Session ID is required')
    .isLength({ max: 255 })
    .withMessage('Session ID must not exceed 255 characters'),
  body('productVariantId')
    .trim()
    .notEmpty()
    .withMessage('Product variant ID is required')
    .isUUID()
    .withMessage('Product variant ID must be a valid UUID'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];

export const updateItemQuantityValidator = [
  param('itemId')
    .trim()
    .notEmpty()
    .withMessage('Item ID is required')
    .isUUID()
    .withMessage('Item ID must be a valid UUID'),
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];

export const removeItemValidator = [
  param('itemId')
    .trim()
    .notEmpty()
    .withMessage('Item ID is required')
    .isUUID()
    .withMessage('Item ID must be a valid UUID'),
];

export const clearCartValidator = [
  body('sessionId')
    .trim()
    .notEmpty()
    .withMessage('Session ID is required')
    .isLength({ max: 255 })
    .withMessage('Session ID must not exceed 255 characters'),
];
