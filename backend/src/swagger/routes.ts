export const authRoutes = {
  "/auth/login": {
    post: {
      tags: ["Autenticação"],
      summary: "Realiza login do administrador",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["login", "senha"],
              properties: {
                login: {
                  type: "string",
                  description: "Login do administrador",
                  example: "WillianAdmin"
                },
                senha: {
                  type: "string",
                  minLength: 6,
                  description: "Senha do administrador",
                  example: "Batman"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Login realizado com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true
                  },
                  data: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            format: "uuid"
                          },
                          nome: {
                            type: "string"
                          },
                          login: {
                            type: "string"
                          }
                        }
                      }
                    }
                  },
                  message: {
                    type: "string",
                    example: "Login realizado com sucesso"
                  }
                }
              }
            }
          },
          headers: {
            "Set-Cookie": {
              description: "Cookies HttpOnly com tokens JWT",
              schema: {
                type: "string"
              }
            }
          }
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
        },
        401: {
          description: "Login ou senha inválidos",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error"
              }
            }
          }
        },
        429: {
          description: "Muitas tentativas de login",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false
                  },
                  error: {
                    type: "string",
                    example: "Muitas tentativas de login. Tente novamente em 1 hora."
                  },
                  code: {
                    type: "string",
                    example: "AUTH_RATE_LIMIT_EXCEEDED"
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  "/auth/me": {
    get: {
      tags: ["Autenticação"],
      summary: "Obtém informações do usuário autenticado",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Informações do usuário",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true
                  },
                  data: {
                    type: "object",
                    properties: {
                      id: {
                        type: "string",
                        format: "uuid"
                      },
                      nome: {
                        type: "string"
                      },
                      login: {
                        type: "string"
                      }
                    }
                  }
                }
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
    }
  },
  "/auth/logout": {
    post: {
      tags: ["Autenticação"],
      summary: "Realiza logout do usuário",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Logout realizado com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true
                  },
                  message: {
                    type: "string",
                    example: "Logout realizado com sucesso"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

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
                cpf: {
                  type: "string",
                  pattern: "^[0-9]{11}$"
                },
                observacoes: {
                  type: "string",
                  maxLength: 2000
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

export const itensRoutes = {
  "/items": {
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
                  maxLength: 2000
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

export const atendimentosRoutes = {
  "/atendimentos": {
    get: {
      tags: ["Atendimentos"],
      summary: "Lista todas as atendimentos",
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
          description: "Lista de atendimentos",
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
      tags: ["Atendimentos"],
      summary: "Cria uma nova atendimento",
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
                  maxLength: 2000
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
          description: "Atendimento criada com sucesso"
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
                  maxLength: 2000
                },
                dataAtendimento: {
                  type: "string",
                  format: "date-time"
                },
                observacoes: {
                  type: "string",
                  maxLength: 2000
                },
                atendimentoIds: {
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
