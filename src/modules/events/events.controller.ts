import { Request, Response } from 'express';
import { EventsService } from './events.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';
import { AuthRequest } from '../../common/types';
import { parsePaginationParams } from '../../common/utils/pagination.util';

const eventsService = new EventsService();

export class EventsController {
  /**
   * @swagger
   * /events:
   *   get:
   *     summary: Get all events
   *     tags: [Events]
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
   *           enum: [UPCOMING, PAST]
   *       - in: query
   *         name: featured
   *         schema:
   *           type: boolean
   *       - in: query
   *         name: city
   *         schema:
   *           type: string
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Events retrieved successfully
   */
  getAllEvents = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { status, featured, city, search } = req.query;

    const filters: any = {};
    if (status) filters.status = status as any;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (city) filters.city = city as string;
    if (search) filters.search = search as string;

    const { events, total } = await eventsService.getAllEvents(page, limit, filters);

    return ResponseUtil.paginated(res, events, total, page, limit, 'Events retrieved successfully');
  });

  /**
   * @swagger
   * /events/{id}:
   *   get:
   *     summary: Get event by ID
   *     tags: [Events]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Event retrieved successfully
   *       404:
   *         description: Event not found
   */
  getEventById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const event = await eventsService.getEventById(id);
    return ResponseUtil.success(res, event, 'Event retrieved successfully');
  });

   /**
   * @swagger
   * /events:
   *   post:
   *     summary: Create new event
   *     tags: [Events]
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
   *               - eventDate
   *               - venue
   *               - location
   *             properties:
   *               title:
   *                 type: string
   *                 maxLength: 255
   *                 example: "Mutuals+ Summer Rooftop Party"
   *               description:
   *                 type: string
   *                 example: "Join us for an unforgettable night of music, art, and culture"
   *               flyerUrl:
   *                 type: string
   *                 format: uri
   *                 example: "https://example.com/flyer.jpg"
   *               eventDate:
   *                 type: string
   *                 format: date-time
   *                 example: "2025-07-15T20:00:00Z"
   *               eventTime:
   *                 type: string
   *                 example: "8:00 PM - 2:00 AM"
   *               venue:
   *                 type: string
   *                 example: "The Rooftop at Skyline"
   *               location:
   *                 type: string
   *                 example: "123 Main Street"
   *               city:
   *                 type: string
   *                 example: "Lagos"
   *               country:
   *                 type: string
   *                 example: "Nigeria"
   *               ticketLink:
   *                 type: string
   *                 format: uri
   *                 example: "https://tickets.example.com/event123"
   *               ticketPlatform:
   *                 type: string
   *                 example: "Eventbrite"
   *               ticketStatus:
   *                 type: string
   *                 example: "On Sale"
   *               type:
   *                 type: string
   *                 example: "Concert"
   *               status:
   *                 type: string
   *                 enum: [UPCOMING, PAST]
   *                 example: "UPCOMING"
   *               featured:
   *                 type: boolean
   *                 example: false
   *     responses:
   *       201:
   *         description: Event created successfully
   */
  createEvent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = {
      ...req.body,
      creatorId: req.user!.id,
    };
    const event = await eventsService.createEvent(data);
    return ResponseUtil.created(res, event, 'Event created successfully');
  });

  /**
   * @swagger
   * /events/{id}:
   *   put:
   *     summary: Update event
   *     tags: [Events]
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
   *                 maxLength: 255
   *                 example: "Mutuals+ Summer Rooftop Party"
   *               description:
   *                 type: string
   *                 example: "Join us for an unforgettable night of music, art, and culture"
   *               flyerUrl:
   *                 type: string
   *                 format: uri
   *                 example: "https://example.com/flyer.jpg"
   *               eventDate:
   *                 type: string
   *                 format: date-time
   *                 example: "2025-07-15T20:00:00Z"
   *               eventTime:
   *                 type: string
   *                 example: "8:00 PM - 2:00 AM"
   *               venue:
   *                 type: string
   *                 example: "The Rooftop at Skyline"
   *               location:
   *                 type: string
   *                 example: "123 Main Street"
   *               city:
   *                 type: string
   *                 example: "Lagos"
   *               country:
   *                 type: string
   *                 example: "Nigeria"
   *               ticketLink:
   *                 type: string
   *                 format: uri
   *                 example: "https://tickets.example.com/event123"
   *               ticketPlatform:
   *                 type: string
   *                 example: "Eventbrite"
   *               status:
   *                 type: string
   *                 enum: [UPCOMING, PAST]
   *                 example: "UPCOMING"
   *               featured:
   *                 type: boolean
   *                 example: false
   *     responses:
   *       200:
   *         description: Event updated successfully
   *       404:
   *         description: Event not found
   */
  updateEvent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const event = await eventsService.updateEvent(id, req.body);
    return ResponseUtil.success(res, event, 'Event updated successfully');
  });

  /**
   * @swagger
   * /events/{id}:
   *   delete:
   *     summary: Delete event
   *     tags: [Events]
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
   *         description: Event deleted successfully
   *       404:
   *         description: Event not found
   */
  deleteEvent = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await eventsService.deleteEvent(id);
    return ResponseUtil.success(res, result, 'Event deleted successfully');
  });

  /**
   * @swagger
   * /events/upcoming:
   *   get:
   *     summary: Get upcoming events
   *     tags: [Events]
   *     parameters:
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
   *         description: Upcoming events retrieved successfully
   */
  getUpcomingEvents = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { events, total } = await eventsService.getUpcomingEvents(page, limit);
    return ResponseUtil.paginated(res, events, total, page, limit, 'Upcoming events retrieved successfully');
  });

  /**
   * @swagger
   * /events/past:
   *   get:
   *     summary: Get past events
   *     tags: [Events]
   *     parameters:
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
   *         description: Past events retrieved successfully
   */
  getPastEvents = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { events, total } = await eventsService.getPastEvents(page, limit);
    return ResponseUtil.paginated(res, events, total, page, limit, 'Past events retrieved successfully');
  });

  /**
   * @swagger
   * /events/featured:
   *   get:
   *     summary: Get featured events
   *     tags: [Events]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Featured events retrieved successfully
   */
  getFeaturedEvents = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    const events = await eventsService.getFeaturedEvents(limit);
    return ResponseUtil.success(res, events, 'Featured events retrieved successfully');
  });

  /**
   * @swagger
   * /events/{eventId}/media:
   *   post:
   *     summary: Add media to event
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: eventId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - mediaUrl
   *               - mediaType
   *             properties:
   *               mediaUrl:
   *                 type: string
   *                 format: uri
   *                 example: "https://example.com/event-photo.jpg"
   *               mediaType:
   *                 type: string
   *                 enum: [IMAGE, VIDEO]
   *                 example: "IMAGE"
   *               caption:
   *                 type: string
   *                 example: "Amazing crowd at the event"
   *               order:
   *                 type: integer
   *                 example: 1
   *     responses:
   *       201:
   *         description: Media added successfully
   */
  addEventMedia = asyncHandler(async (req: Request, res: Response) => {
    const { eventId } = req.params;
    const { mediaUrl, mediaType, caption, order } = req.body;
    const media = await eventsService.addEventMedia(eventId, mediaUrl, mediaType, caption, order);
    return ResponseUtil.created(res, media, 'Media added successfully');
  });

  /**
   * @swagger
   * /events/media/{mediaId}:
   *   delete:
   *     summary: Delete event media
   *     tags: [Events]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: mediaId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Media deleted successfully
   */
  deleteEventMedia = asyncHandler(async (req: Request, res: Response) => {
    const { mediaId } = req.params;
    const result = await eventsService.deleteEventMedia(mediaId);
    return ResponseUtil.success(res, result, 'Media deleted successfully');
  });
}
