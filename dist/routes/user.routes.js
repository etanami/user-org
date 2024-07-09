"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const router = (0, express_1.Router)();
router.get("/:id", authenticateToken_1.authenticateToken, user_controllers_1.getUser);
exports.default = router;
