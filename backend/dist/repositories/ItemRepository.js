"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRepository = void 0;
const BaseRepository_1 = require("./BaseRepository");
class ItemRepository extends BaseRepository_1.BaseRepository {
    constructor(prisma) {
        super(prisma, "item");
    }
    async findAllWithRelations(page = 1, limit = 10, where) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.item.findMany({
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
                            entregaItems: true,
                        },
                    },
                },
            }),
            this.prisma.item.count({ where }),
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
        return this.prisma.item.findUnique({
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
                entregaItems: {
                    include: {
                        entrega: {
                            include: {
                                beneficiario: {
                                    select: {
                                        id: true,
                                        nome: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        entrega: {
                            criadoEm: "desc",
                        },
                    },
                },
                _count: {
                    select: {
                        entregaItems: true,
                    },
                },
            },
        });
    }
    async findByNome(nome, limit = 10) {
        return this.prisma.item.findMany({
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
                unidade: true,
                descricao: true,
            },
        });
    }
    async existsByNome(nome, excludeId) {
        const where = {
            nome: {
                equals: nome,
                mode: "insensitive",
            },
        };
        if (excludeId) {
            where.id = {
                not: excludeId,
            };
        }
        const count = await this.prisma.item.count({ where });
        return count > 0;
    }
    async findActiveForSelection() {
        return this.prisma.item.findMany({
            where: { ativo: true },
            select: {
                id: true,
                nome: true,
                unidade: true,
                descricao: true,
            },
            orderBy: { nome: "asc" },
        });
    }
    async findByUnidade(unidade) {
        return this.prisma.item.findMany({
            where: {
                unidade: {
                    equals: unidade,
                    mode: "insensitive",
                },
                ativo: true,
            },
            select: {
                id: true,
                nome: true,
                unidade: true,
                descricao: true,
            },
            orderBy: { nome: "asc" },
        });
    }
    async findMostUsed(limit = 10) {
        return this.prisma.item.findMany({
            where: { ativo: true },
            include: {
                _count: {
                    select: {
                        entregaItems: true,
                    },
                },
            },
            orderBy: {
                entregaItems: {
                    _count: "desc",
                },
            },
            take: limit,
        });
    }
    async findDistinctUnidades() {
        const result = await this.prisma.item.findMany({
            where: { ativo: true },
            select: {
                unidade: true,
            },
            distinct: ["unidade"],
            orderBy: { unidade: "asc" },
        });
        return result.map((item) => item.unidade);
    }
    async countTotalEntregasByItem(itemId) {
        const result = await this.prisma.entregaItem.aggregate({
            where: { itemId },
            _sum: {
                quantidade: true,
            },
        });
        return result._sum.quantidade || 0;
    }
    async getItemStats(itemId) {
        const [totalEntregas, totalQuantidade, entregaItems] = await Promise.all([
            this.prisma.entregaItem.count({
                where: { itemId },
            }),
            this.countTotalEntregasByItem(itemId),
            this.prisma.entregaItem.findMany({
                where: { itemId },
                include: {
                    entrega: {
                        include: {
                            beneficiario: {
                                select: {
                                    nome: true,
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    entrega: {
                        criadoEm: "desc",
                    },
                },
                take: 10,
            }),
        ]);
        return {
            totalEntregas,
            totalQuantidade,
            ultimasEntregas: entregaItems,
        };
    }
}
exports.ItemRepository = ItemRepository;
//# sourceMappingURL=ItemRepository.js.map