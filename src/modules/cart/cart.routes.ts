import { Router } from 'express';
import { CartController } from './cart.controller';
import { validate } from '../../common/middleware/validate.middleware';
import {
  addItemValidator,
  updateItemQuantityValidator,
  sessionIdValidator,
  clearCartValidator
} from '../../common/validators/cart.validator';

const router = Router();
const cartController = new CartController();

// All cart routes are public (session-based, not user-based)
router.get('/', sessionIdValidator, validate, cartController.getCart);
router.post('/items', addItemValidator, validate, cartController.addItem);
router.put('/items/:itemId', updateItemQuantityValidator, validate, cartController.updateItemQuantity);
router.delete('/items/:itemId', cartController.removeItem);
router.post('/clear', clearCartValidator, validate, cartController.clearCart);
router.get('/summary', sessionIdValidator, validate, cartController.getCartSummary);

export default router;
