import prisma from '../../common/config/database.config';
import { AppError } from '../../common/middleware/error.middleware';
import { generateSlug, generateSlugWithCounter } from '../../common/utils/slug.util';
import { MusicPlatform } from '../../common/types';

interface CreateDJProfileData {
  name: string;
  bio?: string;
  photoUrl?: string;
  socialLinks?: any;
  featured?: boolean;
}

interface UpdateDJProfileData {
  name?: string;
  bio?: string;
  photoUrl?: string;
  socialLinks?: any;
  featured?: boolean;
}

interface CreateDJMixData {
  djProfileId: string;
  title: string;
  seriesNumber?: number;
  description?: string;
  embedUrl: string;
  platform: MusicPlatform;
  duration?: number;
  releaseDate?: Date;
}

interface UpdateDJMixData {
  title?: string;
  seriesNumber?: number;
  description?: string;
  embedUrl?: string;
  platform?: MusicPlatform;
  duration?: number;
  releaseDate?: Date;
}

export class DJsService {
  /**
   * Get all DJ profiles
   */
  async getAllDJProfiles(page: number, limit: number, featured?: boolean) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (featured !== undefined) {
      where.featured = featured;
    }

    const [djs, total] = await Promise.all([
      prisma.dJProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { mixes: true },
          },
        },
      }),
      prisma.dJProfile.count({ where }),
    ]);

    return { djs, total };
  }

  /**
   * Get DJ profile by ID
   */
  async getDJProfileById(id: string) {
    const dj = await prisma.dJProfile.findUnique({
      where: { id },
      include: {
        mixes: {
          orderBy: { releaseDate: 'desc' },
        },
      },
    });

    if (!dj) {
      throw new AppError('DJ profile not found', 404);
    }

    return dj;
  }

  /**
   * Get DJ profile by slug
   */
  async getDJProfileBySlug(slug: string) {
    const dj = await prisma.dJProfile.findUnique({
      where: { slug },
      include: {
        mixes: {
          orderBy: { releaseDate: 'desc' },
        },
      },
    });

    if (!dj) {
      throw new AppError('DJ profile not found', 404);
    }

    return dj;
  }

  /**
   * Create DJ profile
   */
  async createDJProfile(data: CreateDJProfileData) {
    // Generate unique slug
    let slug = generateSlug(data.name);
    let counter = 0;

    while (await prisma.dJProfile.findUnique({ where: { slug } })) {
      counter++;
      slug = generateSlugWithCounter(data.name, counter);
    }

    const dj = await prisma.dJProfile.create({
      data: {
        ...data,
        slug,
      },
    });

    return dj;
  }

  /**
   * Update DJ profile
   */
  async updateDJProfile(id: string, data: UpdateDJProfileData) {
    const existingDJ = await prisma.dJProfile.findUnique({
      where: { id },
    });

    if (!existingDJ) {
      throw new AppError('DJ profile not found', 404);
    }

    // Generate new slug if name is being updated
    let slug = existingDJ.slug;
    if (data.name && data.name !== existingDJ.name) {
      slug = generateSlug(data.name);
      let counter = 0;

      while (await prisma.dJProfile.findFirst({ where: { slug, NOT: { id } } })) {
        counter++;
        slug = generateSlugWithCounter(data.name, counter);
      }
    }

    const dj = await prisma.dJProfile.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });

    return dj;
  }

  /**
   * Delete DJ profile
   */
  async deleteDJProfile(id: string) {
    const dj = await prisma.dJProfile.findUnique({
      where: { id },
    });

    if (!dj) {
      throw new AppError('DJ profile not found', 404);
    }

    await prisma.dJProfile.delete({
      where: { id },
    });

    return { message: 'DJ profile deleted successfully' };
  }

  /**
   * Get featured DJ profiles
   */
  async getFeaturedDJProfiles(limit: number = 10) {
    const djs = await prisma.dJProfile.findMany({
      where: { featured: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { mixes: true },
        },
      },
    });

    return djs;
  }

  // DJ Mixes methods

  /**
   * Get all mixes for a DJ
   */
  async getDJMixes(djProfileId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    // Verify DJ exists
    const dj = await prisma.dJProfile.findUnique({
      where: { id: djProfileId },
    });

    if (!dj) {
      throw new AppError('DJ profile not found', 404);
    }

    const [mixes, total] = await Promise.all([
      prisma.dJMix.findMany({
        where: { djProfileId },
        skip,
        take: limit,
        orderBy: { releaseDate: 'desc' },
        include: {
          djProfile: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.dJMix.count({ where: { djProfileId } }),
    ]);

    return { mixes, total };
  }

  /**
   * Get mix by ID
   */
  async getMixById(id: string) {
    const mix = await prisma.dJMix.findUnique({
      where: { id },
      include: {
        djProfile: true,
      },
    });

    if (!mix) {
      throw new AppError('Mix not found', 404);
    }

    // Increment play count
    await prisma.dJMix.update({
      where: { id },
      data: { playCount: { increment: 1 } },
    });

    return mix;
  }

  /**
   * Create DJ mix
   */
  async createDJMix(data: CreateDJMixData) {
    // Verify DJ exists
    const dj = await prisma.dJProfile.findUnique({
      where: { id: data.djProfileId },
    });

    if (!dj) {
      throw new AppError('DJ profile not found', 404);
    }

    const mix = await prisma.dJMix.create({
      data,
      include: {
        djProfile: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return mix;
  }

  /**
   * Update DJ mix
   */
  async updateDJMix(id: string, data: UpdateDJMixData) {
    const existingMix = await prisma.dJMix.findUnique({
      where: { id },
    });

    if (!existingMix) {
      throw new AppError('Mix not found', 404);
    }

    const mix = await prisma.dJMix.update({
      where: { id },
      data,
      include: {
        djProfile: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return mix;
  }

  /**
   * Delete DJ mix
   */
  async deleteDJMix(id: string) {
    const mix = await prisma.dJMix.findUnique({
      where: { id },
    });

    if (!mix) {
      throw new AppError('Mix not found', 404);
    }

    await prisma.dJMix.delete({
      where: { id },
    });

    return { message: 'Mix deleted successfully' };
  }
}
