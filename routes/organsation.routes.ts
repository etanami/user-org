import { Router } from "express";

import {
  getAllUserOrganisations,
  getOneUserOrganisation,
  createOrganisation
} from "../controllers/organisation.controllers";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.get("/", authenticateToken, getAllUserOrganisations);
router.get("/:orgId", authenticateToken, getOneUserOrganisation);
router.post("/", authenticateToken, createOrganisation);

export default router;
