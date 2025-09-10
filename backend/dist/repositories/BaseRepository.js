"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(prisma, modelName) {
        this.prisma = prisma;
        this.modelName = modelName;
    }
    async findAll(page = 1, limit = 10, where) {
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma[this.modelName].findMany({
                where,
                skip,
                take: limit,
                orderBy: { criadoEm: "desc" },
            }),
            this.prisma[this.modelName].count({ where }),
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
    async findById(id) {
        return this.prisma[this.modelName].findUnique({
            where: { id },
        });
    }
    async create(data) {
        return this.prisma[this.modelName].create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma[this.modelName].update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        try {
            return this.prisma[this.modelName].update({
                where: { id },
                data: { ativo: false },
            });
        }
        catch (error) {
            return this.prisma[this.modelName].delete({
                where: { id },
            });
        }
    }
    async hardDelete(id) {
        return this.prisma[this.modelName].delete({
            where: { id },
        });
    }
    async findMany(where, orderBy, include) {
        return this.prisma[this.modelName].findMany({
            where,
            orderBy,
            include,
        });
    }
    async findFirst(where, include) {
        return this.prisma[this.modelName].findFirst({
            where,
            include,
        });
    }
    async count(where) {
        return this.prisma[this.modelName].count({ where });
    }
    async exists(where) {
        const count = await this.count(where);
        return count > 0;
    }
    async findByIdWithRelations(id, include) {
        return this.prisma[this.modelName].findUnique({
            where: { id },
            include,
        });
    }
    async findAllWithRelations(include, where, orderBy) {
        return this.prisma[this.modelName].findMany({
            where,
            include,
            orderBy,
        });
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map