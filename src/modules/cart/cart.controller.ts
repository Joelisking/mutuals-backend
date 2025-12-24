import { Request, Response } from 'express';
import { CartService } from './cart.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';

const cartService = new CartService();

export class CartController {
  /**
   * @swagger
   * /cart:
   *   get:
   *     summary: Get cart by session ID
   *     tags: [Cart]
   *     parameters:
   *       - in: query
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Cart retrieved successfully
   */
  getCart = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.query;

    if (!sessionId) {
      return ResponseUtil.error(res, 'Session ID is required', 400);
    }

    const cart = await cartService.getOrCreateCart(sessionId as string);
    return ResponseUtil.success(res, cart, 'Cart retrieved successfully');
  });

  /**
   * @swagger
   * /cart/items:
   *   post:
   *     summary: Add item to cart
   *     tags: [Cart]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sessionId
   *               - productVariantId
   *             properties:
   *               sessionId:
   *                 type: string
   *               productVariantId:
   *                 type: string
   *               quantity:
   *                 type: integer
   *                 default: 1
   *     responses:
   *       201:
   *         description: Item added to cart
   */
  addItem = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId, productVariantId, quantity } = req.body;
    const item = await cartService.addItem(sessionId, productVariantId, quantity || 1);
    return ResponseUtil.created(res, item, 'Item added to cart');
  });

  /**
   * @swagger
   * /cart/items/{itemId}:
   *   put:
   *     summary: Update cart item quantity
   *     tags: [Cart]
   *     parameters:
   *       - in: path
   *         name: itemId
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
   *               - quantity
   *             properties:
   *               quantity:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Item quantity updated
   */
  updateItemQuantity = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const item = await cartService.updateItemQuantity(itemId, quantity);
    return ResponseUtil.success(res, item, 'Item quantity updated');
  });

  /**
   * @swagger
   * /cart/items/{itemId}:
   *   delete:
   *     summary: Remove item from cart
   *     tags: [Cart]
   *     parameters:
   *       - in: path
   *         name: itemId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Item removed from cart
   */
  removeItem = asyncHandler(async (req: Request, res: Response) => {
    const { itemId } = req.params;
    const result = await cartService.removeItem(itemId);
    return ResponseUtil.success(res, result, 'Item removed from cart');
  });

  /**
   * @swagger
   * /cart/clear:
   *   post:
   *     summary: Clear cart
   *     tags: [Cart]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sessionId
   *             properties:
   *               sessionId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Cart cleared
   */
  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.body;
    const result = await cartService.clearCart(sessionId);
    return ResponseUtil.success(res, result, 'Cart cleared');
  });

  /**
   * @swagger
   * /cart/summary:
   *   get:
   *     summary: Get cart summary
   *     tags: [Cart]
   *     parameters:
   *       - in: query
   *         name: sessionId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Cart summary retrieved
   */
  getCartSummary = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.query;

    if (!sessionId) {
      return ResponseUtil.error(res, 'Session ID is required', 400);
    }

    const summary = await cartService.getCartSummary(sessionId as string);
    return ResponseUtil.success(res, summary, 'Cart summary retrieved');
  });
}
