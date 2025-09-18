// Beneficiários
export const beneficiariosRoutes = {
  "/beneficiarios": {
    get: {
      tags: ["Beneficiários"],
      summary: "Lista todos os beneficiários",
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Número da página",
          schema: { type: "integer", minimum: 1, default: 1 }
        },
        {
          name: "limit",
          in: "query",
          description: "Itens por página",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 10 }
        },
        {
          name: "search",
          in: "query",
          description: "Termo de busca",
          schema: { type: "string" }
        },
        {
          name: "ativo",
          in: "query",
          description: "Filtrar por status",
          schema: { type: "boolean" }
        }
      ],
      responses: {
        200: {
          description: "Lista de beneficiários",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PaginatedResponse"
              }
            }
          }
        },
        401: {
          description: "Não autorizado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error"
              }
            }
          }
        }
      }
    },
    post: {
      tags: ["Beneficiários"],
      summary: "Cria um novo beneficiário",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["nome", "endereco"],
              properties: {
                nome: {
                  type: "string",
                  minLength: 2,
                  maxLength: 100
                },
                endereco: {
                  type: "string",
                  minLength: 5,
                  maxLength: 200
                },
                telefone: {
                  type: "string",
                  pattern: "^[0-9]{10,11}$"
                },
                email: {
                  type: "string",
                  format: "email"
                },
                observacoes: {
                  type: "string",
                  maxLength: 500
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "Beneficiário criado com sucesso"
        },
        400: {
          description: "Dados inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationError"
              }
            }
          }
        }
      }
    }
  }
};

// Itens
export const itensRoutes = {
  "/itens": {
    get: {
      tags: ["Itens"],
      summary: "Lista todos os itens",
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Número da página",
          schema: { type: "integer", minimum: 1, default: 1 }
        },
        {
          name: "limit",
          in: "query",
          description: "Itens por página",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 10 }
        },
        {
          name: "search",
          in: "query",
          description: "Termo de busca",
          schema: { type: "string" }
        },
        {
          name: "ativo",
          in: "query",
          description: "Filtrar por status",
          schema: { type: "boolean" }
        }
      ],
      responses: {
        200: {
          description: "Lista de itens",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PaginatedResponse"
              }
            }
          }
        }
      }
    },
    post: {
      tags: ["Itens"],
      summary: "Cria um novo item",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["nome", "unidade"],
              properties: {
                nome: {
                  type: "string",
                  minLength: 2,
                  maxLength: 100
                },
                descricao: {
                  type: "string",
                  maxLength: 500
                },
                unidade: {
                  type: "string",
                  maxLength: 20
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "Item criado com sucesso"
        },
        400: {
          description: "Dados inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationError"
              }
            }
          }
        }
      }
    }
  }
};

// Entregas
export const entregasRoutes = {
  "/entregas": {
    get: {
      tags: ["Entregas"],
      summary: "Lista todas as entregas",
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Número da página",
          schema: { type: "integer", minimum: 1, default: 1 }
        },
        {
          name: "limit",
          in: "query",
          description: "Itens por página",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 10 }
        },
        {
          name: "beneficiarioId",
          in: "query",
          description: "ID do beneficiário",
          schema: { type: "string", format: "uuid" }
        },
        {
          name: "rotaId",
          in: "query",
          description: "ID da rota",
          schema: { type: "string", format: "uuid" }
        }
      ],
      responses: {
        200: {
          description: "Lista de entregas",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PaginatedResponse"
              }
            }
          }
        }
      }
    },
    post: {
      tags: ["Entregas"],
      summary: "Cria uma nova entrega",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["beneficiarioId", "items"],
              properties: {
                beneficiarioId: {
                  type: "string",
                  format: "uuid"
                },
                rotaId: {
                  type: "string",
                  format: "uuid"
                },
                observacoes: {
                  type: "string",
                  maxLength: 500
                },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    required: ["itemId", "quantidade"],
                    properties: {
                      itemId: {
                        type: "string",
                        format: "uuid"
                      },
                      quantidade: {
                        type: "number",
                        minimum: 1
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "Entrega criada com sucesso"
        },
        400: {
          description: "Dados inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationError"
              }
            }
          }
        }
      }
    }
  }
};

// Rotas de Entrega
export const rotasRoutes = {
  "/rotas": {
    get: {
      tags: ["Rotas"],
      summary: "Lista todas as rotas",
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Número da página",
          schema: { type: "integer", minimum: 1, default: 1 }
        },
        {
          name: "limit",
          in: "query",
          description: "Itens por página",
          schema: { type: "integer", minimum: 1, maximum: 100, default: 10 }
        },
        {
          name: "search",
          in: "query",
          description: "Termo de busca",
          schema: { type: "string" }
        }
      ],
      responses: {
        200: {
          description: "Lista de rotas",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PaginatedResponse"
              }
            }
          }
        }
      }
    },
    post: {
      tags: ["Rotas"],
      summary: "Cria uma nova rota",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["nome"],
              properties: {
                nome: {
                  type: "string",
                  minLength: 2,
                  maxLength: 100
                },
                descricao: {
                  type: "string",
                  maxLength: 500
                },
                dataEntrega: {
                  type: "string",
                  format: "date-time"
                },
                observacoes: {
                  type: "string",
                  maxLength: 500
                },
                entregaIds: {
                  type: "array",
                  items: {
                    type: "string",
                    format: "uuid"
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "Rota criada com sucesso"
        },
        400: {
          description: "Dados inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationError"
              }
            }
          }
        }
      }
    }
  }
};