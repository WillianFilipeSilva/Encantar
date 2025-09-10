"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeneficiarioRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class BeneficiarioRepository extends BaseRepository_1.BaseRepository {
    constructor(prisma) {
        super(prisma, "beneficiario");
    }
    async findAllWithRelations(page = 1, limit = 10, where) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.beneficiario.findMany({
                where,
                skip,
                take: limit,
                orderBy: { criadoEm: "desc" },
                include: {
                    criadoPor: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
                    modificadoPor: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
                    _count: {
                        select: {
                            entregas: true,
                        },
                    },
                },
            }),
            this.prisma.beneficiario.count({ where }),
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        };
    }
    async findByIdWithRelations(id) {
        return this.prisma.beneficiario.findUnique({
            where: { id },
            include: {
                criadoPor: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
                modificadoPor: {
                    select: {
                        id: true,
                        nome: true,
                    },
                },
                entregas: {
                    include: {
                        entregaItems: {
                            include: {
                                item: true,
                            },
                        },
                        rota: {
                            select: {
                                id: true,
                                nome: true,
                            },
                        },
                    },
                    orderBy: {
                        criadoEm: "desc",
                    },
                },
                _count: {
                    select: {
                        entregas: true,
                    },
                },
            },
        });
    }
    async findByNome(nome, limit = 10) {
        return this.prisma.beneficiario.findMany({
            where: {
                nome: {
                    contains: nome,
                    mode: "insensitive",
                },
                ativo: true,
            },
            take: limit,
            orderBy: { nome: "asc" },
            select: {
                id: true,
                nome: true,
                endereco: true,
                telefone: true,
            },
        });
    }
    async existsByNomeAndEndereco(nome, endereco, excludeId) {
        const where = {
            nome: {
                equals: nome,
                mode: "insensitive",
            },
            endereco: {
                equals: endereco,
                mode: "insensitive",
            },
        };
        if (excludeId) {
            where.id = {
                not: excludeId,
            };
        }
        const count = await this.prisma.beneficiario.count({ where });
        return count > 0;
    }
    async findActiveForSelection() {
        return this.prisma.beneficiario.findMany({
            where: { ativo: true },
            select: {
                id: true,
                nome: true,
                endereco: true,
                telefone: true,
            },
            orderBy: { nome: "asc" },
        });
    }
    async countEntregasByBeneficiario(beneficiarioId) {
        return this.prisma.entrega.count({
            where: { beneficiarioId },
        });
    }
    async findTopBeneficiarios(limit = 10) {
        return this.prisma.beneficiario.findMany({
            where: { ativo: true },
            include: {
                _count: {
                    select: {
                        entregas: true,
                    },
                },
            },
            orderBy: {
                entregas: {
                    _count: "desc",
                },
            },
            take: limit,
        });
    }
}
exports.BeneficiarioRepository = BeneficiarioRepository;
//# sourceMappingURL=BeneficiarioRepository.js.map