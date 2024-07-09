import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import router from "../routes";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});

export default app;
