import { SwaggerDefinition, Options } from 'swagger-jsdoc'

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Teste Caveo - API Documentation',
    version: '1.0.0',
    description: 'Documentação de api em NodeJs com koaJs',
  },
  servers: [
    {
      url: 'http://localhost:3333',
      description: 'Development server',
    },
  ],
  tags: [
    {
      name: 'AUTH',
      description: 'Endpoints de autenticação',
    },
    {
      name: 'USERS',
      description: 'Endpoints de usuários',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // Indica que o token segue o formato JWT
      },
    },
  },
  paths: {
    '/auth': {
      post: {
        tags: ['AUTH'],
        summary: 'Login do usuário',
        parameters: [
          {
            in: 'body',
            name: 'data',
            description: 'Credenciais para login',
            schema: {
              type: 'object',
              properties: {
                email: {
                  example: 'johndoe@email.com',
                },
                password: {
                  example: 'johndoe_123',
                },
              },
            },
          },
        ],
        responses: {
          200: {
            description: 'login successful',
          },
          500: {
            description: 'login error',
          },
        },
      },
    },
    '/auth/create': {
      post: {
        tags: ['AUTH'],
        summary: 'Cadastro de usuário',
        parameters: [
          {
            in: 'body',
            name: 'data',
            description: 'Informações básicas para cadastro',
            schema: {
              type: 'object',
              properties: {
                name: {
                  example: 'John Doe',
                },
                email: {
                  example: 'johndoe@email.com',
                },
                password: {
                  example: 'johndoe_123',
                },
                role: {
                  example: 'comum',
                },
              },
            },
          },
        ],
        responses: {
          201: {
            description: 'Update success',
          },
          401: {
            description: 'Unauthorized',
          },
          500: {
            description: 'Update error',
          },
        },
      },
    },
    '/users': {
      get: {
        tags: ['USERS'],
        summary: 'Lista todos usuários',
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: 'Lista de usuários',
          },
          401: {
            description: 'Você não está autorizado',
          },
        },
      },
    },
    '/me': {
      get: {
        tags: ['USERS'],
        summary: 'Lista apenas o seu usuários',
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          200: {
            description: 'Seu usuários',
          },
          401: {
            description: 'Você não está autorizado',
          },
        },
      },
    },
    '/users/{id}': {
      put: {
        tags: ['USERS'],
        summary: 'Atualiza um usuário',
        security: [
          {
            BearerAuth: [],
          },
        ],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            description: 'ID do usuário',
            schema: {
              type: 'integer',
              exemple: 1,
            },
          },
          {
            in: 'body',
            name: 'data',
            description: 'Nome do usuário e nível de acesso',
            schema: {
              type: 'object',
              properties: {
                name: {
                  example: 'John Doe',
                },
                role: {
                  example: 'comum',
                },
              },
            },
          },
        ],
        responses: {
          201: {
            description: 'Update success',
          },
          500: {
            description: 'Update error',
          },
        },
      },
    },
  },
}

const options: Options = {
  swaggerDefinition,
  apis: [],
}

export default options
