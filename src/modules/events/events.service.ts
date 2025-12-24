import prisma from '../../common/config/database.config';
import { AppError } from '../../common/middleware/error.middleware';
import { EventStatus, MediaType } from '../../common/types';

interface CreateEventData {
  title: string;
  description?: string;
  flyerUrl?: string;
  eventDate: Date;
  eventTime?: string;
  venue: string;
  location: string;
  city?: string;
  country?: string;
  ticketLink?: string;
  ticketPlatform?: string;
  status?: EventStatus;
  featured?: boolean;
  creatorId: string;
}

interface UpdateEventData {
  title?: string;
  description?: string;
  flyerUrl?: string;
  eventDate?: Date;
  eventTime?: string;
  venue?: string;
  location?: string;
  city?: string;
  country?: string;
  ticketLink?: string;
  ticketPlatform?: string;
  status?: EventStatus;
  featured?: boolean;
}

interface EventFilters {
  status?: EventStatus;
  featured?: boolean;
  city?: string;
  search?: string;
}

export class EventsService {
  /**
   * Get all events with pagination and filters
   */
  async getAllEvents(page: number, limit: number, filters?: EventFilters) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters?.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { venue: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { eventDate: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          media: true,
        },
      }),
      prisma.event.count({ where }),
    ]);

    return { events, total };
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        media: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return event;
  }

  /**
   * Create event
   */
  async createEvent(data: CreateEventData) {
    const event = await prisma.event.create({
      data: {
        ...data,
        status: data.status || EventStatus.UPCOMING,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return event;
  }

  /**
   * Update event
   */
  async updateEvent(id: string, data: UpdateEventData) {
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new AppError('Event not found', 404);
    }

    const event = await prisma.event.update({
      where: { id },
      data,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        media: true,
      },
    });

    return event;
  }

  /**
   * Delete event
   */
  async deleteEvent(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    await prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(page: number, limit: number) {
    return this.getAllEvents(page, limit, { status: EventStatus.UPCOMING });
  }

  /**
   * Get past events
   */
  async getPastEvents(page: number, limit: number) {
    return this.getAllEvents(page, limit, { status: EventStatus.PAST });
  }

  /**
   * Get featured events
   */
  async getFeaturedEvents(limit: number = 5) {
    const events = await prisma.event.findMany({
      where: {
        featured: true,
        status: EventStatus.UPCOMING,
      },
      take: limit,
      orderBy: { eventDate: 'asc' },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        media: true,
      },
    });

    return events;
  }

  /**
   * Add media to event
   */
  async addEventMedia(
    eventId: string,
    mediaUrl: string,
    mediaType: MediaType,
    caption?: string,
    order?: number
  ) {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const media = await prisma.eventMedia.create({
      data: {
        eventId,
        mediaUrl,
        mediaType,
        caption,
        order: order || 0,
      },
    });

    return media;
  }

  /**
   * Delete event media
   */
  async deleteEventMedia(mediaId: string) {
    const media = await prisma.eventMedia.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new AppError('Media not found', 404);
    }

    await prisma.eventMedia.delete({
      where: { id: mediaId },
    });

    return { message: 'Media deleted successfully' };
  }

  /**
   * Update event status automatically based on date
   */
  async updateEventStatuses() {
    const now = new Date();

    await prisma.event.updateMany({
      where: {
        eventDate: { lt: now },
        status: EventStatus.UPCOMING,
      },
      data: {
        status: EventStatus.PAST,
      },
    });
  }
}
