import { Router } from "express";

import { getUser } from "../controllers/user.controllers";
import { authenticateToken } from "../middlewares/authenticateToken";

const router = Router();

router.get("/:id", authenticateToken, getUser);

export default router;
