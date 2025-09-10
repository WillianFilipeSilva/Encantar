"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = void 0;
const errorHandler_1 = require("./errorHandler");
const notFound = (req, res, next) => {
    const error = errorHandler_1.CommonErrors.NOT_FOUND(`Rota ${req.method} ${req.originalUrl}`);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=notFound.js.map