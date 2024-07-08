import { Router } from "express";

import {
  getAllUserOrganisations,
  getOneUserOrganisation,
  createOrganisation,
  addUserToAnOrganisation,
} from "../controllers/organisation.controllers";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.get("/", authenticateToken, getAllUserOrganisations);
router.get("/:orgId", authenticateToken, getOneUserOrganisation);
router.post("/", authenticateToken, createOrganisation);
router.post("/:orgId/users", authenticateToken, addUserToAnOrganisation);

export default router;
