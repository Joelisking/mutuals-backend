import { Request, Response } from 'express';
import { SettingsService } from './settings.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';

const settingsService = new SettingsService();

export class SettingsController {
  /**
   * @swagger
   * /settings:
   *   get:
   *     summary: Get all site settings
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Settings retrieved successfully
   */
  getAllSettings = asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.getAllSettings();
    return ResponseUtil.success(res, settings, 'Settings retrieved successfully');
  });

  /**
   * @swagger
   * /settings/initialize:
   *   post:
   *     summary: Initialize default settings
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Default settings initialized
   */
  initializeDefaults = asyncHandler(async (_req: Request, res: Response) => {
    await settingsService.initializeDefaults();
    const settings = await settingsService.getAllSettings();
    return ResponseUtil.success(res, settings, 'Default settings initialized successfully');
  });

  /**
   * @swagger
   * /settings/{key}:
   *   get:
   *     summary: Get setting by key
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Setting key
   *     responses:
   *       200:
   *         description: Setting retrieved successfully
   *       404:
   *         description: Setting not found
   */
  getSettingByKey = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const setting = await settingsService.getSettingByKey(key);
    return ResponseUtil.success(res, setting, 'Setting retrieved successfully');
  });

  /**
   * @swagger
   * /settings/{key}:
   *   put:
   *     summary: Update setting by key
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Setting key
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - value
   *             properties:
   *               value:
   *                 oneOf:
   *                   - type: string
   *                   - type: array
   *                   - type: object
   *               type:
   *                 type: string
   *                 enum: [text, json, boolean, number]
   *               description:
   *                 type: string
   *     responses:
   *       200:
   *         description: Setting updated successfully
   */
  updateSetting = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const { value, type, description } = req.body;
    const setting = await settingsService.updateSetting(key, value, type, description);
    return ResponseUtil.success(res, setting, 'Setting updated successfully');
  });

  /**
   * @swagger
   * /settings/{key}:
   *   delete:
   *     summary: Delete setting by key
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: key
   *         required: true
   *         schema:
   *           type: string
   *         description: Setting key
   *     responses:
   *       200:
   *         description: Setting deleted successfully
   *       404:
   *         description: Setting not found
   */
  deleteSetting = asyncHandler(async (req: Request, res: Response) => {
    const { key } = req.params;
    const result = await settingsService.deleteSetting(key);
    return ResponseUtil.success(res, result, 'Setting deleted successfully');
  });

  /**
   * @swagger
   * /settings/categories/articles:
   *   get:
   *     summary: Get article categories
   *     tags: [Settings]
   *     responses:
   *       200:
   *         description: Article categories retrieved successfully
   */
  getArticleCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await settingsService.getArticleCategories();
    return ResponseUtil.success(res, categories, 'Article categories retrieved successfully');
  });

  /**
   * @swagger
   * /settings/categories/articles:
   *   put:
   *     summary: Update article categories
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - categories
   *             properties:
   *               categories:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Article categories updated successfully
   */
  updateArticleCategories = asyncHandler(async (req: Request, res: Response) => {
    const { categories } = req.body;
    const setting = await settingsService.updateArticleCategories(categories);
    return ResponseUtil.success(res, setting, 'Article categories updated successfully');
  });

  /**
   * @swagger
   * /settings/categories/contact:
   *   get:
   *     summary: Get contact form categories
   *     tags: [Settings]
   *     responses:
   *       200:
   *         description: Contact categories retrieved successfully
   */
  getContactCategories = asyncHandler(async (_req: Request, res: Response) => {
    const categories = await settingsService.getContactCategories();
    return ResponseUtil.success(res, categories, 'Contact categories retrieved successfully');
  });

  /**
   * @swagger
   * /settings/categories/contact:
   *   put:
   *     summary: Update contact form categories
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - categories
   *             properties:
   *               categories:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Contact categories updated successfully
   */
  updateContactCategories = asyncHandler(async (req: Request, res: Response) => {
    const { categories } = req.body;
    const setting = await settingsService.updateContactCategories(categories);
    return ResponseUtil.success(res, setting, 'Contact categories updated successfully');
  });

  /**
   * @swagger
   * /settings/categories/events:
   *   get:
   *     summary: Get event types
   *     tags: [Settings]
   *     responses:
   *       200:
   *         description: Event types retrieved successfully
   */
  getEventTypes = asyncHandler(async (_req: Request, res: Response) => {
    const types = await settingsService.getEventTypes();
    return ResponseUtil.success(res, types, 'Event types retrieved successfully');
  });

  /**
   * @swagger
   * /settings/categories/events:
   *   put:
   *     summary: Update event types
   *     tags: [Settings]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - types
   *             properties:
   *               types:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       200:
   *         description: Event types updated successfully
   */
  updateEventTypes = asyncHandler(async (req: Request, res: Response) => {
    const { types } = req.body;
    const setting = await settingsService.updateEventTypes(types);
    return ResponseUtil.success(res, setting, 'Event types updated successfully');
  });
}
