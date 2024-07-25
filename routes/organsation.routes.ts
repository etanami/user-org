import { Router } from "express";

import {
  getAllUserOrganisations,
  getOneUserOrganisation,
  createOrganisation,
  addUserToAnOrganisation,
} from "../controllers/organisation.controllers";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.use(authenticateToken);

router.get("/", getAllUserOrganisations);
router.get("/:orgId", getOneUserOrganisation);
router.post("/", createOrganisation);
router.post("/:orgId/users", addUserToAnOrganisation);

export default router;
