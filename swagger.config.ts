import { SwaggerDefinition, Options } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Koa API Documentation',
    version: '1.0.0',
    description: 'API documentation for the Koa application',
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Development server',
    },
  ],
  paths: {
    '/users': {
      get: {
        summary: 'Retrieve a list of users',
        responses: {
          200: {
            description: 'A list of users.',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        example: 1,
                      },
                      name: {
                        type: 'string',
                        example: 'John Doe',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        summary: 'Retrieve a user by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the user',
            schema: {
              type: 'integer',
            },
          },
        ],
        responses: {
          200: {
            description: 'User data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      example: 1,
                    },
                    name: {
                      type: 'string',
                      example: 'John Doe',
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'User not found',
          },
        },
      },
    },
  },
};

const options: Options = {
  swaggerDefinition,
  apis: [],
};

export default options;
