import { Router } from 'express';
import { ProductsController } from './products.controller';
import { validate } from '../../common/middleware/validate.middleware';
import { authenticate, authorize } from '../../common/middleware/auth.middleware';
import { UserRole } from '../../common/types';
import {
  createProductValidator,
  updateProductValidator,
  createVariantValidator,
  updateVariantValidator,
  addProductImageValidator,
  productIdValidator,
  slugValidator,
  categoryValidator,
  imageIdValidator,
  recommendationValidator,
  getAllProductsValidator
} from '../../common/validators/products.validator';

const router = Router();
const productsController = new ProductsController();

// Public routes
router.get('/', getAllProductsValidator, validate, productsController.getAllProducts);
router.get('/featured', productsController.getFeaturedProducts);
router.get('/category/:category', categoryValidator, validate, productsController.getProductsByCategory);
router.get('/slug/:slug', slugValidator, validate, productsController.getProductBySlug);
router.get('/:id', productIdValidator, validate, productsController.getProductById);

// Protected routes - Products
router.post('/', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), createProductValidator, validate, productsController.createProduct);
router.put('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateProductValidator, validate, productsController.updateProduct);
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), productIdValidator, validate, productsController.deleteProduct);

// Protected routes - Variants
router.post('/variants', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), createVariantValidator, validate, productsController.createVariant);
router.put('/variants/:variantId', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateVariantValidator, validate, productsController.updateVariant);
router.delete('/variants/:variantId', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), updateVariantValidator, validate, productsController.deleteVariant);

// Protected routes - Images
router.post('/:productId/images', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), addProductImageValidator, validate, productsController.addProductImage);
router.delete('/images/:imageId', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), imageIdValidator, validate, productsController.deleteProductImage);

// Protected routes - Recommendations
router.post('/:productId/recommendations/:recommendedProductId', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN), recommendationValidator, validate, productsController.addRecommendation);

export default router;
