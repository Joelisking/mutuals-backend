import prisma from '../../common/config/database.config';
import { AppError } from '../../common/middleware/error.middleware';

export class CartService {
  /**
   * Get or create cart by session ID
   */
  async getOrCreateCart(sessionId: string, userId?: string) {
    let cart = await prisma.shoppingCart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
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
        },
      },
    });

    if (!cart) {
      // Create new cart that expires in 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      cart = await prisma.shoppingCart.create({
        data: {
          sessionId,
          userId,
          expiresAt,
        },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: {
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
          },
        },
      });
    }

    return cart;
  }

  /**
   * Add item to cart
   */
  async addItem(sessionId: string, productVariantId: string, quantity: number = 1) {
    // Get or create cart
    const cart = await this.getOrCreateCart(sessionId);

    // Check if product variant exists and has stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: productVariantId },
    });

    if (!variant) {
      throw new AppError('Product variant not found', 404);
    }

    if (variant.stockQuantity < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productVariantId,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (variant.stockQuantity < newQuantity) {
        throw new AppError('Insufficient stock', 400);
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          productVariant: {
            include: {
              product: {
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

      return updatedItem;
    }

    // Add new item
    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId,
        quantity,
        priceAtTime: variant.price,
      },
      include: {
        productVariant: {
          include: {
            product: {
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

    return item;
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(itemId: string, quantity: number) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        productVariant: true,
      },
    });

    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    // Check stock
    if (item.productVariant.stockQuantity < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        productVariant: {
          include: {
            product: {
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

    return updatedItem;
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string) {
    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new AppError('Cart item not found', 404);
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { message: 'Item removed from cart' };
  }

  /**
   * Clear cart
   */
  async clearCart(sessionId: string) {
    const cart = await prisma.shoppingCart.findUnique({
      where: { sessionId },
    });

    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Cart cleared' };
  }

  /**
   * Get cart summary (total items and price)
   */
  async getCartSummary(sessionId: string) {
    const cart = await this.getOrCreateCart(sessionId);

    const items = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        productVariant: true,
      },
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + Number(item.priceAtTime) * item.quantity,
      0
    );

    return {
      totalItems,
      totalPrice,
      items: items.length,
    };
  }

  /**
   * Clean up expired carts (run as cron job)
   */
  async cleanupExpiredCarts() {
    const now = new Date();

    const result = await prisma.shoppingCart.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    return { deleted: result.count };
  }
}
