"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const routes_1 = require("./routes");
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
            name: "Entregas",
            description: "Operações relacionadas a entregas"
        },
        {
            name: "Rotas",
            description: "Operações relacionadas a rotas de entrega"
        },
        {
            name: "Modelo de Entregas",
            description: "Operações relacionadas a modelos de entrega"
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
        ...routes_1.beneficiariosRoutes,
        ...routes_1.itensRoutes,
        ...routes_1.entregasRoutes,
        ...routes_1.rotasRoutes
    }
};
function setupSwagger(app) {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    app.get("/api-docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerDocument);
    });
}
//# sourceMappingURL=swagger.js.map