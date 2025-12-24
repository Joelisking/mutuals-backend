import { Router } from 'express';
import { ArticlesController } from './articles.controller';
import {
  createArticleValidator,
  updateArticleValidator,
  articleIdValidator,
  articleSlugValidator,
  relatedArticleValidator,
} from '../../common/validators/articles.validator';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { UserRole } from '../../common/types';

const router = Router();
const articlesController = new ArticlesController();

// Public routes
router.get('/', articlesController.getAllArticles);
router.get('/featured', articlesController.getFeaturedArticles);
router.get('/category/:category', articlesController.getArticlesByCategory);
router.get('/:slug', articleSlugValidator, validate, articlesController.getArticleBySlug);
router.get('/id/:id', articleIdValidator, validate, articlesController.getArticleById);

// Protected routes (Admin, Editor, Contributor)
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR, UserRole.CONTRIBUTOR),
  createArticleValidator,
  validate,
  articlesController.createArticle
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  updateArticleValidator,
  validate,
  articlesController.updateArticle
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  articleIdValidator,
  validate,
  articlesController.deleteArticle
);

router.post(
  '/:articleId/related/:relatedArticleId',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  relatedArticleValidator,
  validate,
  articlesController.addRelatedArticle
);

export default router;
