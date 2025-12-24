import { Request, Response } from 'express';
import { HomepageService } from './homepage.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';

const homepageService = new HomepageService();

export class HomepageController {
  /**
   * @swagger
   * /homepage/hero-slides:
   *   get:
   *     summary: Get all hero slides (Admin)
   *     tags: [Homepage]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Hero slides retrieved successfully
   */
  getAllSlides = asyncHandler(async (req: Request, res: Response) => {
    const slides = await homepageService.getAllSlides();
    return ResponseUtil.success(res, slides, 'Hero slides retrieved successfully');
  });

  /**
   * @swagger
   * /homepage/hero-slides/active:
   *   get:
   *     summary: Get active hero slides (Public)
   *     tags: [Homepage]
   *     responses:
   *       200:
   *         description: Active hero slides retrieved successfully
   */
  getActiveSlides = asyncHandler(async (req: Request, res: Response) => {
    const slides = await homepageService.getActiveSlides();
    return ResponseUtil.success(res, slides, 'Active hero slides retrieved successfully');
  });

  /**
   * @swagger
   * /homepage/hero-slides/{id}:
   *   get:
   *     summary: Get hero slide by ID
   *     tags: [Homepage]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Hero slide retrieved successfully
   */
  getSlideById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const slide = await homepageService.getSlideById(id);
    return ResponseUtil.success(res, slide, 'Hero slide retrieved successfully');
  });

  /**
   * @swagger
   * /homepage/hero-slides:
   *   post:
   *     summary: Create hero slide
   *     tags: [Homepage]
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
   *               - imageUrl
   *               - order
   *             properties:
   *               title:
   *                 type: string
   *               subtitle:
   *                 type: string
   *               imageUrl:
   *                 type: string
   *               linkUrl:
   *                 type: string
   *               linkText:
   *                 type: string
   *               order:
   *                 type: integer
   *               isActive:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Hero slide created successfully
   */
  createSlide = asyncHandler(async (req: Request, res: Response) => {
    const slide = await homepageService.createSlide(req.body);
    return ResponseUtil.created(res, slide, 'Hero slide created successfully');
  });

  /**
   * @swagger
   * /homepage/hero-slides/{id}:
   *   put:
   *     summary: Update hero slide
   *     tags: [Homepage]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               subtitle:
   *                 type: string
   *               imageUrl:
   *                 type: string
   *               linkUrl:
   *                 type: string
   *               linkText:
   *                 type: string
   *               order:
   *                 type: integer
   *               isActive:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Hero slide updated successfully
   */
  updateSlide = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const slide = await homepageService.updateSlide(id, req.body);
    return ResponseUtil.success(res, slide, 'Hero slide updated successfully');
  });

  /**
   * @swagger
   * /homepage/hero-slides/{id}:
   *   delete:
   *     summary: Delete hero slide
   *     tags: [Homepage]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Hero slide deleted successfully
   */
  deleteSlide = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await homepageService.deleteSlide(id);
    return ResponseUtil.success(res, result, 'Hero slide deleted successfully');
  });

  /**
   * @swagger
   * /homepage/hero-slides/reorder:
   *   post:
   *     summary: Reorder hero slides
   *     tags: [Homepage]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - slideOrders
   *             properties:
   *               slideOrders:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                     order:
   *                       type: integer
   *     responses:
   *       200:
   *         description: Slides reordered successfully
   */
  reorderSlides = asyncHandler(async (req: Request, res: Response) => {
    const { slideOrders } = req.body;
    const result = await homepageService.reorderSlides(slideOrders);
    return ResponseUtil.success(res, result, 'Slides reordered successfully');
  });

  /**
   * @swagger
   * /homepage/hero-slides/{id}/toggle:
   *   patch:
   *     summary: Toggle slide active status
   *     tags: [Homepage]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Slide status toggled successfully
   */
  toggleSlideStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const slide = await homepageService.toggleSlideStatus(id);
    return ResponseUtil.success(res, slide, 'Slide status toggled successfully');
  });
}
