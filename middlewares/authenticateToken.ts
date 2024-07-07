import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
  user?: any;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const bearerHeader = req.headers["Authorization"];

  if (!bearerHeader || typeof bearerHeader !== "string") {
    return res.status(401).json({
      status: "Unauthorized",
      message: "Provide token",
    });
  }

  const token = bearerHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "Unauthorized",
      message: "Provide token",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY as string, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: "Forbidden",
        message: "Invalid token",
      });
    }

    req.user = user;
    next();
  });
}
