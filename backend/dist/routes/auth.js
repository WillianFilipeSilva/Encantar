"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/refresh", authController.refresh);
router.get("/invite/:token", authController.validateInvite);
router.get("/me", auth_1.authenticateToken, authController.me);
router.post("/invite", auth_1.authenticateToken, authController.createInvite);
router.post("/logout", auth_1.authenticateToken, authController.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map