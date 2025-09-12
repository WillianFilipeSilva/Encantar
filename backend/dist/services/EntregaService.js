"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntregaService = void 0;
const BaseService_1 = require("./BaseService");
const errorHandler_1 = require("../middleware/errorHandler");
class EntregaService extends BaseService_1.BaseService {
    constructor(repository) {
        super(repository);
    }
    async validateCreateData(data) {
        if (!data.beneficiarioId) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("O beneficiário é obrigatório.");
        }
        if (!data.rotaId) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("A rota é obrigatória.");
        }
        if (!data.items || data.items.length === 0) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("A entrega deve ter pelo menos um item.");
        }
    }
}
exports.EntregaService = EntregaService;
//# sourceMappingURL=EntregaService.js.map