import { Request, Response } from 'express';
import { NewsletterService } from './newsletter.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';
import { parsePaginationParams } from '../../common/utils/pagination.util';

const newsletterService = new NewsletterService();

export class NewsletterController {
  /**
   * @swagger
   * /newsletter/subscribe:
   *   post:
   *     summary: Subscribe to newsletter
   *     tags: [Newsletter]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "subscriber@example.com"
   *               name:
   *                 type: string
   *                 example: "Jane Smith"
   *               source:
   *                 type: string
   *                 enum: [HOMEPAGE, FOOTER, POPUP, EVENT]
   *                 example: "HOMEPAGE"
   *     responses:
   *       201:
   *         description: Subscribed successfully
   */
  subscribe = asyncHandler(async (req: Request, res: Response) => {
    const subscriber = await newsletterService.subscribe(req.body);
    return ResponseUtil.created(res, subscriber, 'Successfully subscribed to newsletter');
  });

  /**
   * @swagger
   * /newsletter/unsubscribe:
   *   post:
   *     summary: Unsubscribe from newsletter
   *     tags: [Newsletter]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "unsubscribe@example.com"
   *     responses:
   *       200:
   *         description: Unsubscribed successfully
   */
  unsubscribe = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const subscriber = await newsletterService.unsubscribe(email);
    return ResponseUtil.success(res, subscriber, 'Successfully unsubscribed from newsletter');
  });

  /**
   * @swagger
   * /newsletter/subscribers:
   *   get:
   *     summary: Get all subscribers (Admin only)
   *     tags: [Newsletter]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [ACTIVE, UNSUBSCRIBED]
   *     responses:
   *       200:
   *         description: Subscribers retrieved successfully
   */
  getAllSubscribers = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { status } = req.query;
    const { subscribers, total } = await newsletterService.getAllSubscribers(page, limit, status as any);
    return ResponseUtil.paginated(res, subscribers, total, page, limit, 'Subscribers retrieved successfully');
  });

  /**
   * @swagger
   * /newsletter/stats:
   *   get:
   *     summary: Get subscription stats (Admin only)
   *     tags: [Newsletter]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Stats retrieved successfully
   */
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await newsletterService.getStats();
    return ResponseUtil.success(res, stats, 'Stats retrieved successfully');
  });
}
