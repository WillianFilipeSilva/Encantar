export declare const beneficiariosRoutes: {
    "/beneficiarios": {
        get: {
            tags: string[];
            summary: string;
            parameters: ({
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum: number;
                    default: number;
                    maximum?: undefined;
                };
            } | {
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
            } | {
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum?: undefined;
                    default?: undefined;
                    maximum?: undefined;
                };
            })[];
            responses: {
                200: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                401: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
            };
        };
        post: {
            tags: string[];
            summary: string;
            requestBody: {
                required: boolean;
                content: {
                    "application/json": {
                        schema: {
                            type: string;
                            required: string[];
                            properties: {
                                nome: {
                                    type: string;
                                    minLength: number;
                                    maxLength: number;
                                };
                                endereco: {
                                    type: string;
                                    minLength: number;
                                    maxLength: number;
                                };
                                telefone: {
                                    type: string;
                                    pattern: string;
                                };
                                email: {
                                    type: string;
                                    format: string;
                                };
                                observacoes: {
                                    type: string;
                                    maxLength: number;
                                };
                            };
                        };
                    };
                };
            };
            responses: {
                201: {
                    description: string;
                };
                400: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
            };
        };
    };
};
export declare const itensRoutes: {
    "/itens": {
        get: {
            tags: string[];
            summary: string;
            parameters: ({
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum: number;
                    default: number;
                    maximum?: undefined;
                };
            } | {
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
            } | {
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum?: undefined;
                    default?: undefined;
                    maximum?: undefined;
                };
            })[];
            responses: {
                200: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
            };
        };
        post: {
            tags: string[];
            summary: string;
            requestBody: {
                required: boolean;
                content: {
                    "application/json": {
                        schema: {
                            type: string;
                            required: string[];
                            properties: {
                                nome: {
                                    type: string;
                                    minLength: number;
                                    maxLength: number;
                                };
                                descricao: {
                                    type: string;
                                    maxLength: number;
                                };
                                unidade: {
                                    type: string;
                                    maxLength: number;
                                };
                            };
                        };
                    };
                };
            };
            responses: {
                201: {
                    description: string;
                };
                400: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
            };
        };
    };
};
export declare const entregasRoutes: {
    "/entregas": {
        get: {
            tags: string[];
            summary: string;
            parameters: ({
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum: number;
                    default: number;
                    maximum?: undefined;
                    format?: undefined;
                };
            } | {
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                    format?: undefined;
                };
            } | {
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    format: string;
                    minimum?: undefined;
                    default?: undefined;
                    maximum?: undefined;
                };
            })[];
            responses: {
                200: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
            };
        };
        post: {
            tags: string[];
            summary: string;
            requestBody: {
                required: boolean;
                content: {
                    "application/json": {
                        schema: {
                            type: string;
                            required: string[];
                            properties: {
                                beneficiarioId: {
                                    type: string;
                                    format: string;
                                };
                                rotaId: {
                                    type: string;
                                    format: string;
                                };
                                observacoes: {
                                    type: string;
                                    maxLength: number;
                                };
                                items: {
                                    type: string;
                                    items: {
                                        type: string;
                                        required: string[];
                                        properties: {
                                            itemId: {
                                                type: string;
                                                format: string;
                                            };
                                            quantidade: {
                                                type: string;
                                                minimum: number;
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
            responses: {
                201: {
                    description: string;
                };
                400: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
            };
        };
    };
};
export declare const rotasRoutes: {
    "/rotas": {
        get: {
            tags: string[];
            summary: string;
            parameters: ({
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum: number;
                    default: number;
                    maximum?: undefined;
                };
            } | {
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum: number;
                    maximum: number;
                    default: number;
                };
            } | {
                name: string;
                in: string;
                description: string;
                schema: {
                    type: string;
                    minimum?: undefined;
                    default?: undefined;
                    maximum?: undefined;
                };
            })[];
            responses: {
                200: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
            };
        };
        post: {
            tags: string[];
            summary: string;
            requestBody: {
                required: boolean;
                content: {
                    "application/json": {
                        schema: {
                            type: string;
                            required: string[];
                            properties: {
                                nome: {
                                    type: string;
                                    minLength: number;
                                    maxLength: number;
                                };
                                descricao: {
                                    type: string;
                                    maxLength: number;
                                };
                                dataEntrega: {
                                    type: string;
                                    format: string;
                                };
                                observacoes: {
                                    type: string;
                                    maxLength: number;
                                };
                                entregaIds: {
                                    type: string;
                                    items: {
                                        type: string;
                                        format: string;
                                    };
                                };
                            };
                        };
                    };
                };
            };
            responses: {
                201: {
                    description: string;
                };
                400: {
                    description: string;
                    content: {
                        "application/json": {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=routes.d.ts.map