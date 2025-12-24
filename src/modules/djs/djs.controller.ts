import { Request, Response } from 'express';
import { DJsService } from './djs.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';
import { parsePaginationParams } from '../../common/utils/pagination.util';

const djsService = new DJsService();

export class DJsController {
  /**
   * @swagger
   * /djs:
   *   get:
   *     summary: Get all DJ profiles
   *     tags: [DJs]
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
   *         name: featured
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: DJ profiles retrieved successfully
   */
  getAllDJProfiles = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { featured } = req.query;
    const featuredFilter = featured !== undefined ? featured === 'true' : undefined;

    const { djs, total } = await djsService.getAllDJProfiles(page, limit, featuredFilter);

    return ResponseUtil.paginated(res, djs, total, page, limit, 'DJ profiles retrieved successfully');
  });

  /**
   * @swagger
   * /djs/{id}:
   *   get:
   *     summary: Get DJ profile by ID
   *     tags: [DJs]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: DJ Profile ID
   *     responses:
   *       200:
   *         description: DJ profile retrieved successfully
   *       404:
   *         description: DJ profile not found
   */
  getDJProfileById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dj = await djsService.getDJProfileById(id);
    return ResponseUtil.success(res, dj, 'DJ profile retrieved successfully');
  });

  /**
   * @swagger
   * /djs/slug/{slug}:
   *   get:
   *     summary: Get DJ profile by slug
   *     tags: [DJs]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *         description: DJ Profile slug
   *     responses:
   *       200:
   *         description: DJ profile retrieved successfully
   *       404:
   *         description: DJ profile not found
   */
  getDJProfileBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const dj = await djsService.getDJProfileBySlug(slug);
    return ResponseUtil.success(res, dj, 'DJ profile retrieved successfully');
  });

  /**
   * @swagger
   * /djs:
   *   post:
   *     summary: Create a new DJ profile
   *     tags: [DJs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - slug
   *             properties:
   *               name:
   *                 type: string
   *               slug:
   *                 type: string
   *               bio:
   *                 type: string
   *               photoUrl:
   *                 type: string
   *               socialLinks:
   *                 type: object
   *               featured:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: DJ profile created successfully
   *       401:
   *         description: Unauthorized
   */
  createDJProfile = asyncHandler(async (req: Request, res: Response) => {
    const dj = await djsService.createDJProfile(req.body);
    return ResponseUtil.created(res, dj, 'DJ profile created successfully');
  });

  /**
   * @swagger
   * /djs/{id}:
   *   put:
   *     summary: Update a DJ profile
   *     tags: [DJs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: DJ Profile ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               slug:
   *                 type: string
   *               bio:
   *                 type: string
   *               photoUrl:
   *                 type: string
   *               socialLinks:
   *                 type: object
   *               featured:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: DJ profile updated successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: DJ profile not found
   */
  updateDJProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dj = await djsService.updateDJProfile(id, req.body);
    return ResponseUtil.success(res, dj, 'DJ profile updated successfully');
  });

  /**
   * @swagger
   * /djs/{id}:
   *   delete:
   *     summary: Delete a DJ profile
   *     tags: [DJs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: DJ Profile ID
   *     responses:
   *       200:
   *         description: DJ profile deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: DJ profile not found
   */
  deleteDJProfile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await djsService.deleteDJProfile(id);
    return ResponseUtil.success(res, result, 'DJ profile deleted successfully');
  });

  /**
   * @swagger
   * /djs/featured:
   *   get:
   *     summary: Get featured DJ profiles
   *     tags: [DJs]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of featured DJs to return
   *     responses:
   *       200:
   *         description: Featured DJ profiles retrieved successfully
   */
  getFeaturedDJProfiles = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const djs = await djsService.getFeaturedDJProfiles(limit);
    return ResponseUtil.success(res, djs, 'Featured DJ profiles retrieved successfully');
  });

  // Mix endpoints
  /**
   * @swagger
   * /djs/{djId}/mixes:
   *   get:
   *     summary: Get all mixes for a DJ
   *     tags: [DJs]
   *     parameters:
   *       - in: path
   *         name: djId
   *         required: true
   *         schema:
   *           type: string
   *         description: DJ Profile ID
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
   *     responses:
   *       200:
   *         description: DJ mixes retrieved successfully
   *       404:
   *         description: DJ profile not found
   */
  getDJMixes = asyncHandler(async (req: Request, res: Response) => {
    const { djId } = req.params;
    const { page, limit } = parsePaginationParams(req.query);
    const { mixes, total } = await djsService.getDJMixes(djId, page, limit);
    return ResponseUtil.paginated(res, mixes, total, page, limit, 'DJ mixes retrieved successfully');
  });

  /**
   * @swagger
   * /djs/mixes/{mixId}:
   *   get:
   *     summary: Get a specific DJ mix by ID
   *     tags: [DJs]
   *     parameters:
   *       - in: path
   *         name: mixId
   *         required: true
   *         schema:
   *           type: string
   *         description: Mix ID
   *     responses:
   *       200:
   *         description: Mix retrieved successfully
   *       404:
   *         description: Mix not found
   */
  getMixById = asyncHandler(async (req: Request, res: Response) => {
    const { mixId } = req.params;
    const mix = await djsService.getMixById(mixId);
    return ResponseUtil.success(res, mix, 'Mix retrieved successfully');
  });

  /**
   * @swagger
   * /djs/mixes:
   *   post:
   *     summary: Create a new DJ mix
   *     tags: [DJs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - djProfileId
   *               - title
   *               - embedUrl
   *               - platform
   *             properties:
   *               djProfileId:
   *                 type: string
   *               title:
   *                 type: string
   *               seriesNumber:
   *                 type: integer
   *               description:
   *                 type: string
   *               embedUrl:
   *                 type: string
   *               platform:
   *                 type: string
   *                 enum: [SPOTIFY, APPLE_MUSIC, SOUNDCLOUD, YOUTUBE]
   *               duration:
   *                 type: integer
   *                 description: Duration in seconds
   *               releaseDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       201:
   *         description: Mix created successfully
   *       401:
   *         description: Unauthorized
   */
  createDJMix = asyncHandler(async (req: Request, res: Response) => {
    const mix = await djsService.createDJMix(req.body);
    return ResponseUtil.created(res, mix, 'Mix created successfully');
  });

  /**
   * @swagger
   * /djs/mixes/{mixId}:
   *   put:
   *     summary: Update a DJ mix
   *     tags: [DJs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: mixId
   *         required: true
   *         schema:
   *           type: string
   *         description: Mix ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               seriesNumber:
   *                 type: integer
   *               description:
   *                 type: string
   *               embedUrl:
   *                 type: string
   *               platform:
   *                 type: string
   *                 enum: [SPOTIFY, APPLE_MUSIC, SOUNDCLOUD, YOUTUBE]
   *               duration:
   *                 type: integer
   *               releaseDate:
   *                 type: string
   *                 format: date-time
   *     responses:
   *       200:
   *         description: Mix updated successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Mix not found
   */
  updateDJMix = asyncHandler(async (req: Request, res: Response) => {
    const { mixId } = req.params;
    const mix = await djsService.updateDJMix(mixId, req.body);
    return ResponseUtil.success(res, mix, 'Mix updated successfully');
  });

  /**
   * @swagger
   * /djs/mixes/{mixId}:
   *   delete:
   *     summary: Delete a DJ mix
   *     tags: [DJs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: mixId
   *         required: true
   *         schema:
   *           type: string
   *         description: Mix ID
   *     responses:
   *       200:
   *         description: Mix deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Mix not found
   */
  deleteDJMix = asyncHandler(async (req: Request, res: Response) => {
    const { mixId } = req.params;
    const result = await djsService.deleteDJMix(mixId);
    return ResponseUtil.success(res, result, 'Mix deleted successfully');
  });
}
