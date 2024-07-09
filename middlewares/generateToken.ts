import * as jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function generateJWTToken(user: any) {
  const { userId } = user;

  // validate user ID
  if (!userId) {
    throw new Error("User ID is required to generate a token");
  }

  const accessToken = jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET_KEY as string,
    { expiresIn: "1h" }
  );
  return { accessToken };
}
