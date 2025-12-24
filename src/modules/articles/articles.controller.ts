import { Request, Response } from 'express';
import { ArticlesService } from './articles.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';
import { AuthRequest } from '../../common/types';
import { parsePaginationParams } from '../../common/utils/pagination.util';

const articlesService = new ArticlesService();

export class ArticlesController {
  /**
   * @swagger
   * /articles:
   *   get:
   *     summary: Get all articles
   *     tags: [Articles]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Items per page
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [DRAFT, PUBLISHED, ARCHIVED]
   *         description: Filter by status
   *       - in: query
   *         name: featured
   *         schema:
   *           type: boolean
   *         description: Filter by featured
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in title, subtitle, and content
   *     responses:
   *       200:
   *         description: Articles retrieved successfully
   */
  getAllArticles = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { category, status, featured, search } = req.query;

    const filters: any = {};
    if (category) filters.category = category as string;
    if (status) filters.status = status as any;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (search) filters.search = search as string;

    const { articles, total } = await articlesService.getAllArticles(page, limit, filters);

    return ResponseUtil.paginated(res, articles, total, page, limit, 'Articles retrieved successfully');
  });

  /**
   * @swagger
   * /articles/{slug}:
   *   get:
   *     summary: Get article by slug
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *         description: Article slug
   *     responses:
   *       200:
   *         description: Article retrieved successfully
   *       404:
   *         description: Article not found
   */
  getArticleBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const article = await articlesService.getArticleBySlug(slug);
    return ResponseUtil.success(res, article, 'Article retrieved successfully');
  });

  /**
   * @swagger
   * /articles/id/{id}:
   *   get:
   *     summary: Get article by ID
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Article ID
   *     responses:
   *       200:
   *         description: Article retrieved successfully
   *       404:
   *         description: Article not found
   */
  getArticleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await articlesService.getArticleById(id);
    return ResponseUtil.success(res, article, 'Article retrieved successfully');
  });

  /**
   * @swagger
   * /articles:
   *   post:
   *     summary: Create new article
   *     tags: [Articles]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - content
   *               - category
   *             properties:
   *               title:
   *                 type: string
   *               subtitle:
   *                 type: string
   *               description:
   *                 type: string
   *               readTime:
   *                 type: string
   *               content:
   *                 type: string
   *               excerpt:
   *                 type: string
   *               heroMediaUrl:
   *                 type: string
   *               heroMediaType:
   *                 type: string
   *                 enum: [IMAGE, VIDEO]
   *               category:
   *                 type: string
   *               tags:
   *                 type: array
   *                 items:
   *                   type: string
   *               status:
   *                 type: string
   *                 enum: [DRAFT, PUBLISHED, ARCHIVED]
   *               publishDate:
   *                 type: string
   *                 format: date-time
   *               featured:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Article created successfully
   *       401:
   *         description: Unauthorized
   */
  createArticle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = {
      ...req.body,
      authorId: req.user!.id,
    };
    const article = await articlesService.createArticle(data);
    return ResponseUtil.created(res, article, 'Article created successfully');
  });

  /**
   * @swagger
   * /articles/{id}:
   *   put:
   *     summary: Update article
   *     tags: [Articles]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Article ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Article updated successfully
   *       404:
   *         description: Article not found
   */
  updateArticle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const article = await articlesService.updateArticle(id, req.body);
    return ResponseUtil.success(res, article, 'Article updated successfully');
  });

  /**
   * @swagger
   * /articles/{id}:
   *   delete:
   *     summary: Delete article
   *     tags: [Articles]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Article ID
   *     responses:
   *       200:
   *         description: Article deleted successfully
   *       404:
   *         description: Article not found
   */
  deleteArticle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await articlesService.deleteArticle(id);
    return ResponseUtil.success(res, result, 'Article deleted successfully');
  });

  /**
   * @swagger
   * /articles/featured:
   *   get:
   *     summary: Get featured articles
   *     tags: [Articles]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Number of featured articles to return
   *     responses:
   *       200:
   *         description: Featured articles retrieved successfully
   */
  getFeaturedArticles = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const articles = await articlesService.getFeaturedArticles(limit);
    return ResponseUtil.success(res, articles, 'Featured articles retrieved successfully');
  });

  /**
   * @swagger
   * /articles/{articleId}/related/{relatedArticleId}:
   *   post:
   *     summary: Add related article
   *     tags: [Articles]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: articleId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: relatedArticleId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: Related article added successfully
   */
  addRelatedArticle = asyncHandler(async (req: Request, res: Response) => {
    const { articleId, relatedArticleId } = req.params;
    const relation = await articlesService.addRelatedArticle(articleId, relatedArticleId);
    return ResponseUtil.created(res, relation, 'Related article added successfully');
  });

  /**
   * @swagger
   * /articles/category/{category}:
   *   get:
   *     summary: Get articles by category
   *     tags: [Articles]
   *     parameters:
   *       - in: path
   *         name: category
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Articles retrieved successfully
   */
  getArticlesByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const { page, limit } = parsePaginationParams(req.query);
    const { articles, total } = await articlesService.getArticlesByCategory(category, page, limit);
    return ResponseUtil.paginated(res, articles, total, page, limit, 'Articles retrieved successfully');
  });
}
