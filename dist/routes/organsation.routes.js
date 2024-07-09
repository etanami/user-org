"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organisation_controllers_1 = require("../controllers/organisation.controllers");
const authenticateToken_1 = require("../middlewares/authenticateToken");
const router = (0, express_1.Router)();
router.get("/", authenticateToken_1.authenticateToken, organisation_controllers_1.getAllUserOrganisations);
router.get("/:orgId", authenticateToken_1.authenticateToken, organisation_controllers_1.getOneUserOrganisation);
router.post("/", authenticateToken_1.authenticateToken, organisation_controllers_1.createOrganisation);
router.post("/:orgId/users", authenticateToken_1.authenticateToken, organisation_controllers_1.addUserToAnOrganisation);
exports.default = router;