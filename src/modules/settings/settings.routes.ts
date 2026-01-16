import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate } from '../../common/middleware/auth.middleware';

const router = Router();
const settingsController = new SettingsController();

// Public routes for fetching categories (used by frontend forms)
router.get('/categories/articles', settingsController.getArticleCategories);
router.get('/categories/contact', settingsController.getContactCategories);
router.get('/categories/events', settingsController.getEventTypes);

// Protected routes (require authentication)
router.get('/', authenticate, settingsController.getAllSettings);
router.post('/initialize', authenticate, settingsController.initializeDefaults);
router.get('/:key', authenticate, settingsController.getSettingByKey);
router.put('/:key', authenticate, settingsController.updateSetting);
router.delete('/:key', authenticate, settingsController.deleteSetting);

// Protected category update routes
router.put('/categories/articles', authenticate, settingsController.updateArticleCategories);
router.put('/categories/contact', authenticate, settingsController.updateContactCategories);
router.put('/categories/events', authenticate, settingsController.updateEventTypes);

export default router;
