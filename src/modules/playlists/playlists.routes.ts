import { Router } from 'express';
import { PlaylistsController } from './playlists.controller';
import {
  createPlaylistValidator,
  updatePlaylistValidator,
  playlistIdValidator,
  platformValidator,
} from '../../common/validators/playlists.validator';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { UserRole } from '../../common/types';

const router = Router();
const playlistsController = new PlaylistsController();

// Public routes
router.get('/', playlistsController.getAllPlaylists);
router.get('/featured', playlistsController.getFeaturedPlaylists);
router.get('/platform/:platform', platformValidator, validate, playlistsController.getPlaylistsByPlatform);
router.get('/series/:seriesName', playlistsController.getPlaylistsBySeries);
router.get('/:id', playlistIdValidator, validate, playlistsController.getPlaylistById);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  createPlaylistValidator,
  validate,
  playlistsController.createPlaylist
);

router.put(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR),
  updatePlaylistValidator,
  validate,
  playlistsController.updatePlaylist
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  playlistIdValidator,
  validate,
  playlistsController.deletePlaylist
);

export default router;
