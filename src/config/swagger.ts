import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'
import path from 'path'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Management API',
      version: '1.0.0',
      description: 'API for managing books and user authentication'
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Book: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            author: { type: 'string' },
            isbn: { type: 'string' },
            description: { type: 'string' },
            ownerId: { type: 'string' },
            averageRating: { type: 'number' },
            reviewCount: { type: 'number' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          },
          required: ['title', 'author', 'description', 'ownerId']
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          },
          required: ['firstName', 'lastName', 'email', 'password']
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            bookId: { type: 'string' },
            userId: { type: 'string' },
            rating: { type: 'number', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: [path.join(__dirname, '../controllers/*.ts'), path.join(__dirname, '../routes/*.ts')] // Path to your route and controller files
}

// Generate the Swagger specification
const swaggerSpec = swaggerJsdoc(options)

// Export the Swagger specification and UI
export { swaggerSpec, swaggerUi }

// Optional: Function to set up Swagger in an Express app
export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
