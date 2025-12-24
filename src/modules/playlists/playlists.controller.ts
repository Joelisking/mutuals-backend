import { Request, Response } from 'express';
import { PlaylistsService } from './playlists.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';
import { parsePaginationParams } from '../../common/utils/pagination.util';

const playlistsService = new PlaylistsService();

export class PlaylistsController {
  /**
   * @swagger
   * /playlists:
   *   get:
   *     summary: Get all playlists
   *     tags: [Playlists]
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
   *         name: platform
   *         schema:
   *           type: string
   *           enum: [SPOTIFY, APPLE_MUSIC, SOUNDCLOUD, YOUTUBE]
   *       - in: query
   *         name: featured
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: seriesName
   *         schema:
   *           type: string
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Playlists retrieved successfully
   */
  getAllPlaylists = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { platform, featured, seriesName, search } = req.query;

    const filters: any = {};
    if (platform) filters.platform = platform as any;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (seriesName) filters.seriesName = seriesName as string;
    if (search) filters.search = search as string;

    const { playlists, total } = await playlistsService.getAllPlaylists(page, limit, filters);

    return ResponseUtil.paginated(res, playlists, total, page, limit, 'Playlists retrieved successfully');
  });

  /**
   * @swagger
   * /playlists/{id}:
   *   get:
   *     summary: Get playlist by ID
   *     tags: [Playlists]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Playlist retrieved successfully
   *       404:
   *         description: Playlist not found
   */
  getPlaylistById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const playlist = await playlistsService.getPlaylistById(id);
    return ResponseUtil.success(res, playlist, 'Playlist retrieved successfully');
  });

  /**
   * @swagger
   * /playlists:
   *   post:
   *     summary: Create new playlist
   *     tags: [Playlists]
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
   *               - curatorName
   *               - platform
   *               - embedUrl
   *     responses:
   *       201:
   *         description: Playlist created successfully
   */
  createPlaylist = asyncHandler(async (req: Request, res: Response) => {
    const playlist = await playlistsService.createPlaylist(req.body);
    return ResponseUtil.created(res, playlist, 'Playlist created successfully');
  });

  /**
   * @swagger
   * /playlists/{id}:
   *   put:
   *     summary: Update playlist
   *     tags: [Playlists]
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
   *         description: Playlist updated successfully
   *       404:
   *         description: Playlist not found
   */
  updatePlaylist = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const playlist = await playlistsService.updatePlaylist(id, req.body);
    return ResponseUtil.success(res, playlist, 'Playlist updated successfully');
  });

  /**
   * @swagger
   * /playlists/{id}:
   *   delete:
   *     summary: Delete playlist
   *     tags: [Playlists]
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
   *         description: Playlist deleted successfully
   *       404:
   *         description: Playlist not found
   */
  deletePlaylist = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await playlistsService.deletePlaylist(id);
    return ResponseUtil.success(res, result, 'Playlist deleted successfully');
  });

  /**
   * @swagger
   * /playlists/featured:
   *   get:
   *     summary: Get featured playlists
   *     tags: [Playlists]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Featured playlists retrieved successfully
   */
  getFeaturedPlaylists = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const playlists = await playlistsService.getFeaturedPlaylists(limit);
    return ResponseUtil.success(res, playlists, 'Featured playlists retrieved successfully');
  });

  /**
   * @swagger
   * /playlists/platform/{platform}:
   *   get:
   *     summary: Get playlists by platform
   *     tags: [Playlists]
   *     parameters:
   *       - in: path
   *         name: platform
   *         required: true
   *         schema:
   *           type: string
   *           enum: [SPOTIFY, APPLE_MUSIC, SOUNDCLOUD, YOUTUBE]
   *     responses:
   *       200:
   *         description: Playlists retrieved successfully
   */
  getPlaylistsByPlatform = asyncHandler(async (req: Request, res: Response) => {
    const { platform } = req.params;
    const { page, limit } = parsePaginationParams(req.query);
    const { playlists, total } = await playlistsService.getPlaylistsByPlatform(platform as any, page, limit);
    return ResponseUtil.paginated(res, playlists, total, page, limit, 'Playlists retrieved successfully');
  });

  /**
   * @swagger
   * /playlists/series/{seriesName}:
   *   get:
   *     summary: Get playlists by series
   *     tags: [Playlists]
   *     parameters:
   *       - in: path
   *         name: seriesName
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Playlists retrieved successfully
   */
  getPlaylistsBySeries = asyncHandler(async (req: Request, res: Response) => {
    const { seriesName } = req.params;
    const { page, limit } = parsePaginationParams(req.query);
    const { playlists, total } = await playlistsService.getPlaylistsBySeries(seriesName, page, limit);
    return ResponseUtil.paginated(res, playlists, total, page, limit, 'Playlists retrieved successfully');
  });
}
