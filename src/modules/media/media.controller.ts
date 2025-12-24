import { Request, Response } from 'express';
import { MediaService } from './media.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';
import { AuthRequest } from '../../common/types';
import { parsePaginationParams } from '../../common/utils/pagination.util';

const mediaService = new MediaService();

export class MediaController {
  /**
   * @swagger
   * /media/upload:
   *   post:
   *     summary: Upload a media file
   *     tags: [Media]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - file
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *               folder:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [IMAGE, VIDEO, AUDIO, DOCUMENT]
   *               useCloudinary:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: File uploaded successfully
   */
  uploadFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      return ResponseUtil.error(res, 'No file uploaded', 400);
    }

    const { folder = 'uploads', fileType = 'IMAGE', useCloudinary = 'true' } = req.body;

    // Upload to cloud storage
    const uploadResult = await mediaService.uploadFile(
      req.file,
      folder,
      useCloudinary === 'true'
    );

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${req.file.originalname}`;

    // Save to database
    const mediaFile = await mediaService.saveMediaFile(
      uploadResult.url,
      filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      fileType,
      req.user?.id
    );

    return ResponseUtil.created(res, mediaFile, 'File uploaded successfully');
  });

  /**
   * @swagger
   * /media:
   *   get:
   *     summary: Get all media files
   *     tags: [Media]
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
   *         name: type
   *         schema:
   *           type: string
   *           enum: [IMAGE, VIDEO, AUDIO, DOCUMENT]
   *     responses:
   *       200:
   *         description: Media files retrieved successfully
   */
  getAllMediaFiles = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { fileType, uploadedBy } = req.query;

    const { mediaFiles, total } = await mediaService.getAllMediaFiles(
      page,
      limit,
      fileType as string,
      uploadedBy as string
    );

    return ResponseUtil.paginated(
      res,
      mediaFiles,
      total,
      page,
      limit,
      'Media files retrieved successfully'
    );
  });

  /**
   * @swagger
   * /media/{id}:
   *   get:
   *     summary: Get media file by ID
   *     tags: [Media]
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
   *         description: Media file retrieved successfully
   */
  getMediaFileById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const mediaFile = await mediaService.getMediaFileById(id);
    return ResponseUtil.success(res, mediaFile, 'Media file retrieved successfully');
  });

  /**
   * @swagger
   * /media/{id}:
   *   delete:
   *     summary: Delete media file
   *     tags: [Media]
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
   *         description: Media file deleted successfully
   */
  deleteMediaFile = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await mediaService.deleteMediaFile(id);
    return ResponseUtil.success(res, result, 'Media file deleted successfully');
  });
}
