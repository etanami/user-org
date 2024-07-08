import { Router } from "express";

import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import organisationRouter from "./organsation.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/api/users", userRouter);
router.use("/api/organisations", organisationRouter);

export default router;
