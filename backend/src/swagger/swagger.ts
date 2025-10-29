import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { beneficiariosRoutes, itensRoutes, atendimentosRoutes, rotasRoutes } from "./routes";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "API Encantar",
    description: "Documentação da API do sistema Encantar",
    version: "1.0.0",
    contact: {
      name: "Willian Filipe",
      email: ""
    }
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor Local"
    }
  ],
  tags: [
    {
      name: "Beneficiários",
      description: "Operações relacionadas a beneficiários"
    },
    {
      name: "Itens",
      description: "Operações relacionadas a itens"
    },
    {
      name: "Atendimentos",
      description: "Operações relacionadas a atendimentos"
    },
    {
      name: "Rotas",
      description: "Operações relacionadas a rotas de atendimento"
    },
    {
      name: "Modelo de Atendimentos",
      description: "Operações relacionadas a modelos de atendimento"
    },
    {
      name: "Autenticação",
      description: "Operações relacionadas a autenticação"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false
          },
          error: {
            type: "string",
            example: "Mensagem de erro"
          },
          code: {
            type: "string",
            example: "ERROR_CODE"
          }
        }
      },
      ValidationError: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false
          },
          error: {
            type: "string",
            example: "Dados inválidos"
          },
          code: {
            type: "string",
            example: "VALIDATION_ERROR"
          },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: {
                  type: "string",
                  example: "nome"
                },
                message: {
                  type: "string",
                  example: "Nome é obrigatório"
                }
              }
            }
          }
        }
      },
      PaginatedResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true
          },
          data: {
            type: "array",
            items: {
              type: "object"
            }
          },
          pagination: {
            type: "object",
            properties: {
              page: {
                type: "number",
                example: 1
              },
              limit: {
                type: "number",
                example: 10
              },
              total: {
                type: "number",
                example: 100
              },
              totalPages: {
                type: "number",
                example: 10
              },
              hasNext: {
                type: "boolean",
                example: true
              },
              hasPrev: {
                type: "boolean",
                example: false
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: {
    ...beneficiariosRoutes,
    ...itensRoutes,
    ...atendimentosRoutes,
    ...rotasRoutes
  }
};

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  
  app.get("/api-docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocument);
  });
}