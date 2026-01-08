import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bajaj Broking Trading API',
      version: '1.0.0',
      description: 'Wrapper SDK for Bajaj Broking Trading APIs',
      contact: {
        name: 'Bajaj Broking',
        url: 'https:
      },
    },
    servers: [
      {
        url: `http:
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes