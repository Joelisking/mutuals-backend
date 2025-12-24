import prisma from '../../common/config/database.config';
import { AppError } from '../../common/middleware/error.middleware';
import { MusicPlatform } from '../../common/types';

interface CreatePlaylistData {
  title: string;
  description?: string;
  coverArtUrl?: string;
  curatorName: string;
  curatorId?: string;
  platform: MusicPlatform;
  embedUrl: string;
  externalLink?: string;
  seriesName?: string;
  moodDescription?: string;
  featured?: boolean;
}

interface UpdatePlaylistData {
  title?: string;
  description?: string;
  coverArtUrl?: string;
  curatorName?: string;
  platform?: MusicPlatform;
  embedUrl?: string;
  externalLink?: string;
  seriesName?: string;
  moodDescription?: string;
  featured?: boolean;
}

interface PlaylistFilters {
  platform?: MusicPlatform;
  featured?: boolean;
  seriesName?: string;
  search?: string;
}

export class PlaylistsService {
  /**
   * Get all playlists with pagination and filters
   */
  async getAllPlaylists(page: number, limit: number, filters?: PlaylistFilters) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.platform) {
      where.platform = filters.platform;
    }

    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters?.seriesName) {
      where.seriesName = { contains: filters.seriesName, mode: 'insensitive' };
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { curatorName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [playlists, total] = await Promise.all([
      prisma.playlist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          curator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.playlist.count({ where }),
    ]);

    return { playlists, total };
  }

  /**
   * Get playlist by ID
   */
  async getPlaylistById(id: string) {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
      include: {
        curator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!playlist) {
      throw new AppError('Playlist not found', 404);
    }

    // Increment play count
    await prisma.playlist.update({
      where: { id },
      data: { playCount: { increment: 1 } },
    });

    return playlist;
  }

  /**
   * Create new playlist
   */
  async createPlaylist(data: CreatePlaylistData) {
    const playlist = await prisma.playlist.create({
      data,
      include: {
        curator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return playlist;
  }

  /**
   * Update playlist
   */
  async updatePlaylist(id: string, data: UpdatePlaylistData) {
    const existingPlaylist = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!existingPlaylist) {
      throw new AppError('Playlist not found', 404);
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data,
      include: {
        curator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return playlist;
  }

  /**
   * Delete playlist
   */
  async deletePlaylist(id: string) {
    const playlist = await prisma.playlist.findUnique({
      where: { id },
    });

    if (!playlist) {
      throw new AppError('Playlist not found', 404);
    }

    await prisma.playlist.delete({
      where: { id },
    });

    return { message: 'Playlist deleted successfully' };
  }

  /**
   * Get featured playlists
   */
  async getFeaturedPlaylists(limit: number = 10) {
    const playlists = await prisma.playlist.findMany({
      where: { featured: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        curator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return playlists;
  }

  /**
   * Get playlists by platform
   */
  async getPlaylistsByPlatform(platform: MusicPlatform, page: number, limit: number) {
    return this.getAllPlaylists(page, limit, { platform });
  }

  /**
   * Get playlists by series
   */
  async getPlaylistsBySeries(seriesName: string, page: number, limit: number) {
    return this.getAllPlaylists(page, limit, { seriesName });
  }
}
