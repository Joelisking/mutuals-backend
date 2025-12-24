import { Request, Response } from 'express';
import { SubmissionsService } from './submissions.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';
import { AuthRequest } from '../../common/types';
import { parsePaginationParams } from '../../common/utils/pagination.util';

const submissionsService = new SubmissionsService();

export class SubmissionsController {
  // Contact Submissions
  /**
   * @swagger
   * /submissions/contact:
   *   post:
   *     summary: Submit a contact form
   *     tags: [Submissions]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - message
   *             properties:
   *               name:
   *                 type: string
   *                 example: "John Doe"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "john.doe@example.com"
   *               subject:
   *                 type: string
   *                 example: "Question about upcoming events"
   *               message:
   *                 type: string
   *                 example: "I would like to know more about your upcoming events in Lagos."
   *               submissionType:
   *                 type: string
   *                 enum: [GENERAL, ARTIST, DJ, DESIGNER]
   *                 example: "GENERAL"
   *     responses:
   *       201:
   *         description: Submission received successfully
   */
  createContactSubmission = asyncHandler(async (req: Request, res: Response) => {
    const submission = await submissionsService.createContactSubmission(req.body);
    return ResponseUtil.created(res, submission, 'Submission received successfully');
  });

  /**
   * @swagger
   * /submissions/contact:
   *   get:
   *     summary: Get all contact submissions
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
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
   *         name: status
   *         schema:
   *           type: string
   *           enum: [NEW, REVIEWED, ARCHIVED]
   *         description: Filter by status
   *     responses:
   *       200:
   *         description: Submissions retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  getAllContactSubmissions = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { status } = req.query;
    const { submissions, total } = await submissionsService.getAllContactSubmissions(page, limit, status as any);
    return ResponseUtil.paginated(res, submissions, total, page, limit, 'Submissions retrieved successfully');
  });

  /**
   * @swagger
   * /submissions/contact/{id}:
   *   get:
   *     summary: Get a contact submission by ID
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Submission ID
   *     responses:
   *       200:
   *         description: Submission retrieved successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Submission not found
   */
  getContactSubmissionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const submission = await submissionsService.getContactSubmissionById(id);
    return ResponseUtil.success(res, submission, 'Submission retrieved successfully');
  });

  /**
   * @swagger
   * /submissions/contact/{id}/status:
   *   patch:
   *     summary: Update contact submission status
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Submission ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [NEW, REVIEWED, ARCHIVED]
   *                 example: "REVIEWED"
   *     responses:
   *       200:
   *         description: Submission status updated successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Submission not found
   */
  updateContactSubmissionStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const submission = await submissionsService.updateContactSubmissionStatus(id, status);
    return ResponseUtil.success(res, submission, 'Submission status updated successfully');
  });

  /**
   * @swagger
   * /submissions/contact/{id}:
   *   delete:
   *     summary: Delete a contact submission
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Submission ID
   *     responses:
   *       200:
   *         description: Submission deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Submission not found
   */
  deleteContactSubmission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await submissionsService.deleteContactSubmission(id);
    return ResponseUtil.success(res, result, 'Submission deleted successfully');
  });

  // Artist Submissions
  /**
   * @swagger
   * /submissions/artist:
   *   post:
   *     summary: Submit an artist application
   *     tags: [Submissions]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - role
   *               - pitchMessage
   *             properties:
   *               name:
   *                 type: string
   *                 example: "DJ Spinmaster"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "spinmaster@example.com"
   *               role:
   *                 type: string
   *                 description: artist, dj, designer
   *                 example: "DJ"
   *               bio:
   *                 type: string
   *                 example: "Afrobeats DJ with 5+ years experience in Lagos nightlife scene"
   *               portfolioLinks:
   *                 type: object
   *                 description: JSON object with portfolio URLs
   *                 example: {"soundcloud": "https://soundcloud.com/djspinmaster", "mixcloud": "https://mixcloud.com/djspinmaster"}
   *               socialMedia:
   *                 type: object
   *                 description: JSON object with social media handles
   *                 example: {"instagram": "@djspinmaster", "twitter": "@djspinmaster"}
   *               pitchMessage:
   *                 type: string
   *                 example: "I would love to bring my unique Afrobeats sound to the Mutuals+ community"
   *               attachments:
   *                 type: array
   *                 items:
   *                   type: string
   *                 description: Array of attachment URLs
   *                 example: ["https://example.com/mix1.mp3", "https://example.com/press-kit.pdf"]
   *     responses:
   *       201:
   *         description: Application submitted successfully
   */
  createArtistSubmission = asyncHandler(async (req: Request, res: Response) => {
    const submission = await submissionsService.createArtistSubmission(req.body);
    return ResponseUtil.created(res, submission, 'Application submitted successfully');
  });

  /**
   * @swagger
   * /submissions/artist:
   *   get:
   *     summary: Get all artist submissions
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
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
   *         name: status
   *         schema:
   *           type: string
   *           enum: [NEW, REVIEWED, ARCHIVED]
   *         description: Filter by status
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search by name or email
   *     responses:
   *       200:
   *         description: Submissions retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  getAllArtistSubmissions = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { status, search } = req.query;
    const { submissions, total } = await submissionsService.getAllArtistSubmissions(page, limit, status as any, search as string);
    return ResponseUtil.paginated(res, submissions, total, page, limit, 'Submissions retrieved successfully');
  });

  /**
   * @swagger
   * /submissions/artist/{id}:
   *   get:
   *     summary: Get an artist submission by ID
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Submission ID
   *     responses:
   *       200:
   *         description: Submission retrieved successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Submission not found
   */
  getArtistSubmissionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const submission = await submissionsService.getArtistSubmissionById(id);
    return ResponseUtil.success(res, submission, 'Submission retrieved successfully');
  });

  /**
   * @swagger
   * /submissions/artist/{id}/status:
   *   patch:
   *     summary: Update artist submission status
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Submission ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [NEW, REVIEWED, ARCHIVED]
   *                 example: "REVIEWED"
   *     responses:
   *       200:
   *         description: Submission status updated successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Submission not found
   */
  updateArtistSubmissionStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const submission = await submissionsService.updateArtistSubmissionStatus(id, status, req.user!.id);
    return ResponseUtil.success(res, submission, 'Submission status updated successfully');
  });

  /**
   * @swagger
   * /submissions/artist/{id}:
   *   delete:
   *     summary: Delete an artist submission
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Submission ID
   *     responses:
   *       200:
   *         description: Submission deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Submission not found
   */
  deleteArtistSubmission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await submissionsService.deleteArtistSubmission(id);
    return ResponseUtil.success(res, result, 'Submission deleted successfully');
  });

  // Stats
  /**
   * @swagger
   * /submissions/stats:
   *   get:
   *     summary: Get submission statistics
   *     tags: [Submissions]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Stats retrieved successfully
   *       401:
   *         description: Unauthorized
   */
  getStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await submissionsService.getStats();
    return ResponseUtil.success(res, stats, 'Stats retrieved successfully');
  });
}
