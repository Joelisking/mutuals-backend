import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.config';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Mutuals+ API Documentation',
      version: '1.0.0',
      description: `
        Mutuals+ is a culture-forward platform spotlighting emerging artists, DJs, designers,
        and creatives across the African diaspora and beyond. This API powers the platform's
        editorial content, playlists, events, and merchandise.
      `,
      contact: {
        name: 'Mutuals+ Team',
        email: 'info@mutuals.plus',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: env.NODE_ENV === 'production'
      ? [
          {
            url: process.env.RAILWAY_PUBLIC_DOMAIN
              ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/${env.API_VERSION}`
              : `https://web-production-10b9e.up.railway.app/api/${env.API_VERSION}`,
            description: 'Production Server',
          },
          {
            url: `https://api.mutuals.plus/api/${env.API_VERSION}`,
            description: 'Custom Domain',
          },
        ]
      : [
          {
            url: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
            description: 'Local Development',
          },
          {
            url: `https://web-production-10b9e.up.railway.app/api/${env.API_VERSION}`,
            description: 'Railway Production',
          },
        ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operation successful',
            },
            data: {
              type: 'object',
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              example: 100,
            },
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            totalPages: {
              type: 'integer',
              example: 10,
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Admin authentication endpoints',
      },
      {
        name: 'Articles',
        description: 'Editorial content and spotlights',
      },
      {
        name: 'Playlists',
        description: 'Curated playlists and music content',
      },
      {
        name: 'DJs',
        description: 'DJ profiles and mixes',
      },
      {
        name: 'Events',
        description: 'Events management',
      },
      {
        name: 'Products',
        description: 'Merchandise and shop',
      },
      {
        name: 'Cart',
        description: 'Shopping cart management',
      },
      {
        name: 'Newsletter',
        description: 'Newsletter subscriptions',
      },
      {
        name: 'Submissions',
        description: 'Contact and artist submissions',
      },
      {
        name: 'Media',
        description: 'Media upload and management',
      },
      {
        name: 'Homepage',
        description: 'Homepage content',
      },
    ],
  },
  apis: [
    './src/modules/**/*.ts',
    './src/modules/**/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
