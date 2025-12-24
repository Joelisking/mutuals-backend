import { Request, Response } from 'express';
import { ProductsService } from './products.service';
import { ResponseUtil } from '../../common/utils/response.util';
import { asyncHandler } from '../../common/middleware/error.middleware';
import { parsePaginationParams } from '../../common/utils/pagination.util';

const productsService = new ProductsService();

export class ProductsController {
  /**
   * @swagger
   * /products:
   *   get:
   *     summary: Get all products
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Items per page
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [ACTIVE, SOLD_OUT, ARCHIVED]
   *         description: Filter by status
   *       - in: query
   *         name: featured
   *         schema:
   *           type: boolean
   *         description: Filter by featured
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search in product name and description
   *       - in: query
   *         name: minPrice
   *         schema:
   *           type: number
   *         description: Minimum price filter
   *       - in: query
   *         name: maxPrice
   *         schema:
   *           type: number
   *         description: Maximum price filter
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   */
  getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = parsePaginationParams(req.query);
    const { category, status, featured, search, minPrice, maxPrice } = req.query;

    const filters: any = {};
    if (category) filters.category = category as string;
    if (status) filters.status = status as any;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (search) filters.search = search as string;
    if (minPrice) filters.minPrice = parseFloat(minPrice as string);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);

    const { products, total } = await productsService.getAllProducts(page, limit, filters);

    return ResponseUtil.paginated(res, products, total, page, limit, 'Products retrieved successfully');
  });

  /**
   * @swagger
   * /products/{id}:
   *   get:
   *     summary: Get product by ID
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID
   *     responses:
   *       200:
   *         description: Product retrieved successfully
   *       404:
   *         description: Product not found
   */
  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await productsService.getProductById(id);
    return ResponseUtil.success(res, product, 'Product retrieved successfully');
  });

  /**
   * @swagger
   * /products/slug/{slug}:
   *   get:
   *     summary: Get product by slug
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: slug
   *         required: true
   *         schema:
   *           type: string
   *         description: Product slug
   *     responses:
   *       200:
   *         description: Product retrieved successfully
   *       404:
   *         description: Product not found
   */
  getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const product = await productsService.getProductBySlug(slug);
    return ResponseUtil.success(res, product, 'Product retrieved successfully');
  });

  /**
   * @swagger
   * /products:
   *   post:
   *     summary: Create a new product
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - slug
   *               - category
   *               - basePrice
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Mutuals+ Classic T-Shirt"
   *               slug:
   *                 type: string
   *                 example: "mutuals-classic-tshirt"
   *               description:
   *                 type: string
   *                 example: "Premium cotton t-shirt with Mutuals+ branding"
   *               category:
   *                 type: string
   *                 example: "Apparel"
   *               basePrice:
   *                 type: number
   *                 example: 35.00
   *               currency:
   *                 type: string
   *                 default: USD
   *                 example: "USD"
   *               featured:
   *                 type: boolean
   *                 example: true
   *               status:
   *                 type: string
   *                 enum: [ACTIVE, SOLD_OUT, ARCHIVED]
   *                 example: "ACTIVE"
   *     responses:
   *       201:
   *         description: Product created successfully
   *       401:
   *         description: Unauthorized
   */
  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await productsService.createProduct(req.body);
    return ResponseUtil.created(res, product, 'Product created successfully');
  });

  /**
   * @swagger
   * /products/{id}:
   *   put:
   *     summary: Update a product
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Mutuals+ Classic T-Shirt (Updated)"
   *               slug:
   *                 type: string
   *                 example: "mutuals-classic-tshirt-v2"
   *               description:
   *                 type: string
   *                 example: "Updated premium cotton t-shirt with new Mutuals+ branding"
   *               category:
   *                 type: string
   *                 example: "Apparel"
   *               basePrice:
   *                 type: number
   *                 example: 40.00
   *               featured:
   *                 type: boolean
   *                 example: true
   *               status:
   *                 type: string
   *                 enum: [ACTIVE, SOLD_OUT, ARCHIVED]
   *                 example: "ACTIVE"
   *     responses:
   *       200:
   *         description: Product updated successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found
   */
  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await productsService.updateProduct(id, req.body);
    return ResponseUtil.success(res, product, 'Product updated successfully');
  });

  /**
   * @swagger
   * /products/{id}:
   *   delete:
   *     summary: Delete a product
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID
   *     responses:
   *       200:
   *         description: Product deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found
   */
  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await productsService.deleteProduct(id);
    return ResponseUtil.success(res, result, 'Product deleted successfully');
  });

  /**
   * @swagger
   * /products/featured:
   *   get:
   *     summary: Get featured products
   *     tags: [Products]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Number of featured products to return
   *     responses:
   *       200:
   *         description: Featured products retrieved successfully
   */
  getFeaturedProducts = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const products = await productsService.getFeaturedProducts(limit);
    return ResponseUtil.success(res, products, 'Featured products retrieved successfully');
  });

  /**
   * @swagger
   * /products/category/{category}:
   *   get:
   *     summary: Get products by category
   *     tags: [Products]
   *     parameters:
   *       - in: path
   *         name: category
   *         required: true
   *         schema:
   *           type: string
   *         description: Product category
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Page number
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Items per page
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   */
  getProductsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const { page, limit } = parsePaginationParams(req.query);
    const { products, total } = await productsService.getProductsByCategory(category, page, limit);
    return ResponseUtil.paginated(res, products, total, page, limit, 'Products retrieved successfully');
  });

  // Variants
  /**
   * @swagger
   * /products/variants:
   *   post:
   *     summary: Create a product variant
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - productId
   *               - sku
   *               - price
   *             properties:
   *               productId:
   *                 type: string
   *                 example: "cm1234567890abcdef"
   *               sku:
   *                 type: string
   *                 example: "MUTUALS-TSHIRT-BLK-L"
   *               size:
   *                 type: string
   *                 example: "L"
   *               color:
   *                 type: string
   *                 example: "Black"
   *               price:
   *                 type: number
   *                 example: 35.00
   *               stockQuantity:
   *                 type: integer
   *                 example: 50
   *     responses:
   *       201:
   *         description: Variant created successfully
   *       401:
   *         description: Unauthorized
   */
  createVariant = asyncHandler(async (req: Request, res: Response) => {
    const variant = await productsService.createVariant(req.body);
    return ResponseUtil.created(res, variant, 'Variant created successfully');
  });

  /**
   * @swagger
   * /products/variants/{variantId}:
   *   put:
   *     summary: Update a product variant
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: variantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Variant ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               size:
   *                 type: string
   *                 example: "XL"
   *               color:
   *                 type: string
   *                 example: "Navy Blue"
   *               price:
   *                 type: number
   *                 example: 38.00
   *               stockQuantity:
   *                 type: integer
   *                 example: 25
   *     responses:
   *       200:
   *         description: Variant updated successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Variant not found
   */
  updateVariant = asyncHandler(async (req: Request, res: Response) => {
    const { variantId } = req.params;
    const variant = await productsService.updateVariant(variantId, req.body);
    return ResponseUtil.success(res, variant, 'Variant updated successfully');
  });

  /**
   * @swagger
   * /products/variants/{variantId}:
   *   delete:
   *     summary: Delete a product variant
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: variantId
   *         required: true
   *         schema:
   *           type: string
   *         description: Variant ID
   *     responses:
   *       200:
   *         description: Variant deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Variant not found
   */
  deleteVariant = asyncHandler(async (req: Request, res: Response) => {
    const { variantId } = req.params;
    const result = await productsService.deleteVariant(variantId);
    return ResponseUtil.success(res, result, 'Variant deleted successfully');
  });

  // Images
  /**
   * @swagger
   * /products/{productId}/images:
   *   post:
   *     summary: Add an image to a product
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - imageUrl
   *             properties:
   *               imageUrl:
   *                 type: string
   *                 format: uri
   *                 example: "https://example.com/product-image.jpg"
   *               isPrimary:
   *                 type: boolean
   *                 example: true
   *               order:
   *                 type: integer
   *                 example: 1
   *     responses:
   *       201:
   *         description: Image added successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found
   */
  addProductImage = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const { imageUrl, isPrimary, order } = req.body;
    const image = await productsService.addProductImage(productId, imageUrl, isPrimary, order);
    return ResponseUtil.created(res, image, 'Image added successfully');
  });

  /**
   * @swagger
   * /products/images/{imageId}:
   *   delete:
   *     summary: Delete a product image
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: imageId
   *         required: true
   *         schema:
   *           type: string
   *         description: Image ID
   *     responses:
   *       200:
   *         description: Image deleted successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Image not found
   */
  deleteProductImage = asyncHandler(async (req: Request, res: Response) => {
    const { imageId } = req.params;
    const result = await productsService.deleteProductImage(imageId);
    return ResponseUtil.success(res, result, 'Image deleted successfully');
  });

  // Recommendations
  /**
   * @swagger
   * /products/{productId}/recommendations/{recommendedProductId}:
   *   post:
   *     summary: Add a product recommendation
   *     tags: [Products]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: string
   *         description: Product ID
   *       - in: path
   *         name: recommendedProductId
   *         required: true
   *         schema:
   *           type: string
   *         description: Recommended Product ID
   *     responses:
   *       201:
   *         description: Recommendation added successfully
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found
   */
  addRecommendation = asyncHandler(async (req: Request, res: Response) => {
    const { productId, recommendedProductId } = req.params;
    const recommendation = await productsService.addRecommendation(productId, recommendedProductId);
    return ResponseUtil.created(res, recommendation, 'Recommendation added successfully');
  });
}
