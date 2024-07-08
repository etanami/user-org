import { Router } from "express";

import { getAllUserOrganisations } from "../controllers/organisation.controllers";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.get("/", authenticateToken, getAllUserOrganisations);

export default router;
