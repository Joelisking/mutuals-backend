import prisma from '../../common/config/database.config';
import { AppError } from '../../common/middleware/error.middleware';
import { MediaType } from '../../common/types';

interface CreateSlideData {
  title?: string;
  subtitle?: string;
  mediaUrl: string;
  mediaType?: MediaType;
  ctaLink?: string;
  ctaText?: string;
  order: number;
  active?: boolean;
}

interface UpdateSlideData {
  title?: string;
  subtitle?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  ctaLink?: string;
  ctaText?: string;
  order?: number;
  active?: boolean;
}

export class HomepageService {
  /**
   * Get all hero slides
   */
  async getAllSlides() {
    const slides = await prisma.homepageHeroSlide.findMany({
      orderBy: { order: 'asc' },
    });

    return slides;
  }

  /**
   * Get active hero slides (for public display)
   */
  async getActiveSlides() {
    const slides = await prisma.homepageHeroSlide.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });

    return slides;
  }

  /**
   * Get slide by ID
   */
  async getSlideById(id: string) {
    const slide = await prisma.homepageHeroSlide.findUnique({
      where: { id },
    });

    if (!slide) {
      throw new AppError('Hero slide not found', 404);
    }

    return slide;
  }

  /**
   * Create hero slide
   */
  async createSlide(data: CreateSlideData) {
    const slide = await prisma.homepageHeroSlide.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType || 'IMAGE',
        ctaLink: data.ctaLink,
        ctaText: data.ctaText,
        order: data.order,
        active: data.active !== undefined ? data.active : true,
      },
    });

    return slide;
  }

  /**
   * Update hero slide
   */
  async updateSlide(id: string, data: UpdateSlideData) {
    const existingSlide = await this.getSlideById(id);

    const slide = await prisma.homepageHeroSlide.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        ctaLink: data.ctaLink,
        ctaText: data.ctaText,
        order: data.order,
        active: data.active,
      },
    });

    return slide;
  }

  /**
   * Delete hero slide
   */
  async deleteSlide(id: string) {
    const slide = await this.getSlideById(id);

    await prisma.homepageHeroSlide.delete({
      where: { id },
    });

    return { message: 'Hero slide deleted successfully' };
  }

  /**
   * Reorder slides
   */
  async reorderSlides(slideOrders: { id: string; order: number }[]) {
    await prisma.$transaction(
      slideOrders.map((item) =>
        prisma.homepageHeroSlide.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return { message: 'Slides reordered successfully' };
  }

  /**
   * Toggle slide active status
   */
  async toggleSlideStatus(id: string) {
    const slide = await this.getSlideById(id);

    const updatedSlide = await prisma.homepageHeroSlide.update({
      where: { id },
      data: { active: !slide.active },
    });

    return updatedSlide;
  }
}
