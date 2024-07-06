import { Router } from "express";

import { RegisterUser } from "../controllers/user.controllers";

const router = Router();

router.post("/register", RegisterUser);

export default router;
