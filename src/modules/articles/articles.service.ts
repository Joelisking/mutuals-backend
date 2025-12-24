import prisma from '../../common/config/database.config';
import { AppError } from '../../common/middleware/error.middleware';
import { generateSlug, generateSlugWithCounter } from '../../common/utils/slug.util';
import { ArticleStatus } from '../../common/types';

interface CreateArticleData {
  title: string;
  subtitle?: string;
  content: string;
  excerpt?: string;
  heroMediaUrl?: string;
  heroMediaType?: 'IMAGE' | 'VIDEO';
  category: string;
  tags?: string[];
  status?: ArticleStatus;
  publishDate?: Date;
  featured?: boolean;
  authorId: string;
}

interface UpdateArticleData {
  title?: string;
  subtitle?: string;
  content?: string;
  excerpt?: string;
  heroMediaUrl?: string;
  heroMediaType?: 'IMAGE' | 'VIDEO';
  category?: string;
  tags?: string[];
  status?: ArticleStatus;
  publishDate?: Date;
  featured?: boolean;
}

interface ArticleFilters {
  category?: string;
  status?: ArticleStatus;
  featured?: boolean;
  search?: string;
}

export class ArticlesService {
  /**
   * Get all articles with pagination and filters
   */
  async getAllArticles(
    page: number,
    limit: number,
    filters?: ArticleFilters
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    } else {
      // Default to published articles for public access
      where.status = ArticleStatus.PUBLISHED;
    }

    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { subtitle: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishDate: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return { articles, total };
  }

  /**
   * Get article by slug
   */
  async getArticleBySlug(slug: string) {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        relatedArticles: {
          include: {
            relatedArticle: {
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                heroMediaUrl: true,
                category: true,
                publishDate: true,
              },
            },
          },
        },
      },
    });

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string) {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    return article;
  }

  /**
   * Create new article
   */
  async createArticle(data: CreateArticleData) {
    // Generate unique slug
    let slug = generateSlug(data.title);
    let counter = 0;

    while (await prisma.article.findUnique({ where: { slug } })) {
      counter++;
      slug = generateSlugWithCounter(data.title, counter);
    }

    const article = await prisma.article.create({
      data: {
        ...data,
        slug,
        tags: data.tags || [],
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return article;
  }

  /**
   * Update article
   */
  async updateArticle(id: string, data: UpdateArticleData) {
    // Check if article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      throw new AppError('Article not found', 404);
    }

    // Generate new slug if title is being updated
    let slug = existingArticle.slug;
    if (data.title && data.title !== existingArticle.title) {
      slug = generateSlug(data.title);
      let counter = 0;

      while (await prisma.article.findFirst({ where: { slug, NOT: { id } } })) {
        counter++;
        slug = generateSlugWithCounter(data.title, counter);
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return article;
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string) {
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new AppError('Article not found', 404);
    }

    await prisma.article.delete({
      where: { id },
    });

    return { message: 'Article deleted successfully' };
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(limit: number = 5) {
    const articles = await prisma.article.findMany({
      where: {
        featured: true,
        status: ArticleStatus.PUBLISHED,
      },
      take: limit,
      orderBy: { publishDate: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return articles;
  }

  /**
   * Add related articles
   */
  async addRelatedArticle(articleId: string, relatedArticleId: string) {
    // Check if both articles exist
    const [article, relatedArticle] = await Promise.all([
      prisma.article.findUnique({ where: { id: articleId } }),
      prisma.article.findUnique({ where: { id: relatedArticleId } }),
    ]);

    if (!article || !relatedArticle) {
      throw new AppError('One or both articles not found', 404);
    }

    // Check if relation already exists
    const existingRelation = await prisma.articleRelation.findFirst({
      where: {
        articleId,
        relatedArticleId,
      },
    });

    if (existingRelation) {
      throw new AppError('Relation already exists', 400);
    }

    const relation = await prisma.articleRelation.create({
      data: {
        articleId,
        relatedArticleId,
      },
    });

    return relation;
  }

  /**
   * Get articles by category
   */
  async getArticlesByCategory(category: string, page: number, limit: number) {
    return this.getAllArticles(page, limit, { category, status: ArticleStatus.PUBLISHED });
  }
}
