import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateJWTToken = () => {
  const secretKey = process.env.JWT_SECRET_KEY;
  const claims = {
    sub: "public_key",
    exp: 3600,
  };
  const token = jwt.sign(claims, secretKey as string, { algorithm: "HS256" });
  return token;
};
