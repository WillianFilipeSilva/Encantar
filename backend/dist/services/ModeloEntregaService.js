"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModeloEntregaService = void 0;
const BaseService_1 = require("./BaseService");
const errorHandler_1 = require("../middleware/errorHandler");
class ModeloEntregaService extends BaseService_1.BaseService {
    constructor(repository) {
        super(repository);
    }
    async validateCreateData(data) {
        if (!data.nome || data.nome.trim().length < 3) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("O nome do modelo deve ter pelo menos 3 caracteres.");
        }
    }
    async validateUpdateData(data) {
        if (data.nome !== undefined &&
            (!data.nome || data.nome.trim().length < 3)) {
            throw errorHandler_1.CommonErrors.BAD_REQUEST("O nome do modelo deve ter pelo menos 3 caracteres.");
        }
    }
}
exports.ModeloEntregaService = ModeloEntregaService;
//# sourceMappingURL=ModeloEntregaService.js.map