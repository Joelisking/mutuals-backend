import { body, param } from 'express-validator';

export const createArticleValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Subtitle must not exceed 500 characters'),
  body('description')
    .optional()
    .trim(),
  body('readTime')
    .optional()
    .trim(),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('excerpt')
    .optional()
    .trim(),
  body('heroMediaUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Hero media URL must be a valid URL'),
  body('heroMediaType')
    .optional()
    .isIn(['IMAGE', 'VIDEO'])
    .withMessage('Hero media type must be IMAGE or VIDEO'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Invalid status'),
  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Publish date must be a valid date'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

export const updateArticleValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid article ID'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Title must not exceed 255 characters'),
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Subtitle must not exceed 500 characters'),
  body('description')
    .optional()
    .trim(),
  body('readTime')
    .optional()
    .trim(),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty'),
  body('heroMediaUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Hero media URL must be a valid URL'),
  body('heroMediaType')
    .optional()
    .isIn(['IMAGE', 'VIDEO'])
    .withMessage('Hero media type must be IMAGE or VIDEO'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
    .withMessage('Invalid status'),
  body('publishDate')
    .optional()
    .isISO8601()
    .withMessage('Publish date must be a valid date'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
];

export const articleIdValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid article ID'),
];

export const articleSlugValidator = [
  param('slug')
    .trim()
    .notEmpty()
    .withMessage('Slug is required'),
];

export const relatedArticleValidator = [
  param('articleId')
    .isUUID()
    .withMessage('Invalid article ID'),
  param('relatedArticleId')
    .isUUID()
    .withMessage('Invalid related article ID'),
];
