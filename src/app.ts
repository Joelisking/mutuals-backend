import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './common/config/env.config';
import { swaggerSpec } from './common/config/swagger.config';
import { errorHandler, notFound } from './common/middleware/error.middleware';
import { apiLimiter } from './common/middleware/rate-limiter.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import articlesRoutes from './modules/articles/articles.routes';
import playlistsRoutes from './modules/playlists/playlists.routes';
import djsRoutes from './modules/djs/djs.routes';
import newsletterRoutes from './modules/newsletter/newsletter.routes';
import submissionsRoutes from './modules/submissions/submissions.routes';
import eventsRoutes from './modules/events/events.routes';
import productsRoutes from './modules/products/products.routes';
import cartRoutes from './modules/cart/cart.routes';
import mediaRoutes from './modules/media/media.routes';
import homepageRoutes from './modules/homepage/homepage.routes';
import settingsRoutes from './modules/settings/settings.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    const corsOptions = {
      origin: env.CORS_ORIGIN.split(','),
      credentials: true,
      optionsSuccessStatus: 200,
    };
    this.app.use(cors(corsOptions));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Rate limiting
    this.app.use(`/api/${env.API_VERSION}`, apiLimiter);
  }

  private initializeSwagger(): void {
    // Swagger UI
    this.app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Mutuals+ API Docs',
      })
    );

    // Swagger JSON endpoint
    this.app.get('/api-docs.json', (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(swaggerSpec);
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
      });
    });

    // API base route
    this.app.get(`/api/${env.API_VERSION}`, (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Mutuals+ API',
        version: env.API_VERSION,
        documentation: `/api-docs`,
      });
    });

    // Initialize module routes
    this.app.use(`/api/${env.API_VERSION}/auth`, authRoutes);
    this.app.use(`/api/${env.API_VERSION}/articles`, articlesRoutes);
    this.app.use(`/api/${env.API_VERSION}/playlists`, playlistsRoutes);
    this.app.use(`/api/${env.API_VERSION}/djs`, djsRoutes);
    this.app.use(`/api/${env.API_VERSION}/newsletter`, newsletterRoutes);
    this.app.use(`/api/${env.API_VERSION}/submissions`, submissionsRoutes);
    this.app.use(`/api/${env.API_VERSION}/events`, eventsRoutes);
    this.app.use(`/api/${env.API_VERSION}/products`, productsRoutes);
    this.app.use(`/api/${env.API_VERSION}/cart`, cartRoutes);
    this.app.use(`/api/${env.API_VERSION}/media`, mediaRoutes);
    this.app.use(`/api/${env.API_VERSION}/homepage`, homepageRoutes);
    this.app.use(`/api/${env.API_VERSION}/settings`, settingsRoutes);
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFound);

    // Global error handler
    this.app.use(errorHandler);
  }
}

export default new App().app;
