import prisma from '../../common/config/database.config';
import { AppError } from '../../common/middleware/error.middleware';
import { generateSlug, generateSlugWithCounter } from '../../common/utils/slug.util';
import { ProductStatus } from '../../common/types';

interface CreateProductData {
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  currency?: string;
  featured?: boolean;
  status?: ProductStatus;
}

interface UpdateProductData {
  name?: string;
  description?: string;
  category?: string;
  basePrice?: number;
  currency?: string;
  featured?: boolean;
  status?: ProductStatus;
}

interface CreateVariantData {
  productId: string;
  sku: string;
  size?: string;
  color?: string;
  price: number;
  stockQuantity: number;
}

interface UpdateVariantData {
  sku?: string;
  size?: string;
  color?: string;
  price?: number;
  stockQuantity?: number;
}

interface ProductFilters {
  category?: string;
  status?: ProductStatus;
  featured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class ProductsService {
  /**
   * Get all products with pagination and filters
   */
  async getAllProducts(page: number, limit: number, filters?: ProductFilters) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.status) {
      where.status = filters.status;
    } else {
      // Default to active products for public
      where.status = ProductStatus.ACTIVE;
    }

    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.basePrice = {};
      if (filters.minPrice) where.basePrice.gte = filters.minPrice;
      if (filters.maxPrice) where.basePrice.lte = filters.maxPrice;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          variants: true,
          images: {
            orderBy: { order: 'asc' },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: {
          orderBy: { order: 'asc' },
        },
        recommendedProducts: {
          include: {
            recommendedProduct: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        variants: true,
        images: {
          orderBy: { order: 'asc' },
        },
        recommendedProducts: {
          include: {
            recommendedProduct: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  }

  /**
   * Create product
   */
  async createProduct(data: CreateProductData) {
    // Generate unique slug
    let slug = generateSlug(data.name);
    let counter = 0;

    while (await prisma.product.findUnique({ where: { slug } })) {
      counter++;
      slug = generateSlugWithCounter(data.name, counter);
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
      },
      include: {
        variants: true,
        images: true,
      },
    });

    return product;
  }

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductData) {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new AppError('Product not found', 404);
    }

    // Generate new slug if name is being updated
    let slug = existingProduct.slug;
    if (data.name && data.name !== existingProduct.name) {
      slug = generateSlug(data.name);
      let counter = 0;

      while (await prisma.product.findFirst({ where: { slug, NOT: { id } } })) {
        counter++;
        slug = generateSlugWithCounter(data.name, counter);
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
      include: {
        variants: true,
        images: true,
      },
    });

    return product;
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    await prisma.product.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 10) {
    const products = await prisma.product.findMany({
      where: {
        featured: true,
        status: ProductStatus.ACTIVE,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        variants: true,
      },
    });

    return products;
  }

  // Product Variants

  /**
   * Create product variant
   */
  async createVariant(data: CreateVariantData) {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if SKU already exists
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new AppError('SKU already exists', 400);
    }

    const variant = await prisma.productVariant.create({
      data,
    });

    return variant;
  }

  /**
   * Update product variant
   */
  async updateVariant(id: string, data: UpdateVariantData) {
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!existingVariant) {
      throw new AppError('Variant not found', 404);
    }

    // Check if SKU is being updated and if it's unique
    if (data.sku && data.sku !== existingVariant.sku) {
      const existingSku = await prisma.productVariant.findUnique({
        where: { sku: data.sku },
      });

      if (existingSku) {
        throw new AppError('SKU already exists', 400);
      }
    }

    const variant = await prisma.productVariant.update({
      where: { id },
      data,
    });

    return variant;
  }

  /**
   * Delete product variant
   */
  async deleteVariant(id: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id },
    });

    if (!variant) {
      throw new AppError('Variant not found', 404);
    }

    await prisma.productVariant.delete({
      where: { id },
    });

    return { message: 'Variant deleted successfully' };
  }

  // Product Images

  /**
   * Add product image
   */
  async addProductImage(productId: string, imageUrl: string, isPrimary: boolean = false, order: number = 0) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // If this is primary, unset other primary images
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const image = await prisma.productImage.create({
      data: {
        productId,
        imageUrl,
        isPrimary,
        order,
      },
    });

    return image;
  }

  /**
   * Delete product image
   */
  async deleteProductImage(imageId: string) {
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new AppError('Image not found', 404);
    }

    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return { message: 'Image deleted successfully' };
  }

  /**
   * Add product recommendation
   */
  async addRecommendation(productId: string, recommendedProductId: string) {
    // Check if both products exist
    const [product, recommendedProduct] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.product.findUnique({ where: { id: recommendedProductId } }),
    ]);

    if (!product || !recommendedProduct) {
      throw new AppError('One or both products not found', 404);
    }

    // Check if recommendation already exists
    const existing = await prisma.productRecommendation.findFirst({
      where: {
        productId,
        recommendedProductId,
      },
    });

    if (existing) {
      throw new AppError('Recommendation already exists', 400);
    }

    const recommendation = await prisma.productRecommendation.create({
      data: {
        productId,
        recommendedProductId,
      },
    });

    return recommendation;
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, page: number, limit: number) {
    return this.getAllProducts(page, limit, { category, status: ProductStatus.ACTIVE });
  }
}
