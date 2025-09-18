"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeneficiarioService = void 0;
const BaseService_1 = require("./BaseService");
const errorHandler_1 = require("../middleware/errorHandler");
class BeneficiarioService extends BaseService_1.BaseService {
    constructor(beneficiarioRepository) {
        super(beneficiarioRepository);
        this.beneficiarioRepository = beneficiarioRepository;
    }
    async findAllWithRelations(page = 1, limit = 10, filters) {
        if (page < 1)
            page = 1;
        if (limit < 1 || limit > 100)
            limit = 10;
        return this.beneficiarioRepository.findAllWithRelations(page, limit, filters);
    }
    async findByIdWithRelations(id) {
        if (!id) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("ID é obrigatório");
        }
        const beneficiario = await this.beneficiarioRepository.findByIdWithRelations(id);
        if (!beneficiario) {
            throw errorHandler_1.CommonErrors.NOT_FOUND("Beneficiário não encontrado");
        }
        return beneficiario;
    }
    async create(data, userId) {
        await this.validateCreateData(data);
        const exists = await this.beneficiarioRepository.existsByNomeAndEndereco(data.nome, data.endereco);
        if (exists) {
            throw errorHandler_1.CommonErrors.CONFLICT("Já existe um beneficiário com este nome e endereço");
        }
        const createData = this.addAuditData(data, userId, "create");
        return this.beneficiarioRepository.create(createData);
    }
    async update(id, data, userId) {
        if (!id) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("ID é obrigatório");
        }
        await this.findById(id);
        await this.validateUpdateData(data);
        if (data.nome || data.endereco) {
            const current = await this.findById(id);
            const nome = data.nome || current.nome;
            const endereco = data.endereco || current.endereco;
            const exists = await this.beneficiarioRepository.existsByNomeAndEndereco(nome, endereco, id);
            if (exists) {
                throw errorHandler_1.CommonErrors.CONFLICT("Já existe um beneficiário com este nome e endereço");
            }
        }
        const updateData = this.addAuditData(data, userId, "update");
        return this.beneficiarioRepository.update(id, updateData);
    }
    async findByNome(nome, limit = 10) {
        if (!nome || nome.trim().length < 2) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Nome deve ter pelo menos 2 caracteres");
        }
        return this.beneficiarioRepository.findByNome(nome.trim(), limit);
    }
    async findActiveForSelection() {
        return this.beneficiarioRepository.findActiveForSelection();
    }
    async findTopBeneficiarios(limit = 10) {
        if (limit < 1 || limit > 50)
            limit = 10;
        return this.beneficiarioRepository.findTopBeneficiarios(limit);
    }
    async validateCreateData(data) {
        if (!data.nome || data.nome.trim().length < 2) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Nome deve ter pelo menos 2 caracteres");
        }
        if (!data.endereco || data.endereco.trim().length < 5) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Endereço deve ter pelo menos 5 caracteres");
        }
        if (data.email && !this.isValidEmail(data.email)) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Email inválido");
        }
        if (data.telefone && !this.isValidPhone(data.telefone)) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Telefone inválido");
        }
    }
    async validateUpdateData(data) {
        if (data.nome !== undefined &&
            (!data.nome || data.nome.trim().length < 2)) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Nome deve ter pelo menos 2 caracteres");
        }
        if (data.endereco !== undefined &&
            (!data.endereco || data.endereco.trim().length < 5)) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Endereço deve ter pelo menos 5 caracteres");
        }
        if (data.email !== undefined &&
            data.email &&
            !this.isValidEmail(data.email)) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Email inválido");
        }
        if (data.telefone !== undefined &&
            data.telefone &&
            !this.isValidPhone(data.telefone)) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("Telefone inválido");
        }
    }
    transformBeneficiarioData(beneficiario) {
        return {
            id: beneficiario.id,
            nome: beneficiario.nome,
            endereco: beneficiario.endereco,
            telefone: beneficiario.telefone,
            email: beneficiario.email,
            observacoes: beneficiario.observacoes,
            ativo: beneficiario.ativo,
            criadoEm: beneficiario.criadoEm,
            atualizadoEm: beneficiario.atualizadoEm,
            criadoPor: {
                id: beneficiario.criadoPorId,
                nome: beneficiario.criadoPor?.nome || 'Desconhecido'
            },
            modificadoPor: beneficiario.modificadoPorId && beneficiario.modificadoPor
                ? {
                    id: beneficiario.modificadoPorId,
                    nome: beneficiario.modificadoPor.nome
                }
                : undefined,
        };
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    isValidPhone(phone) {
        const cleanPhone = phone.replace(/\D/g, "");
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    }
}
exports.BeneficiarioService = BeneficiarioService;
//# sourceMappingURL=BeneficiarioService.js.map