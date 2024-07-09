import request from "supertest";
import app from "../src/index";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { generateJWTToken } from "../middlewares/generateToken";

const prisma = new PrismaClient();

// Test for token generation
describe("Token Generation", () => {
  it("should generate a token with an access token", async () => {
    const user = { userId: "123", email: "test@example.com" };
    const { accessToken } = await generateJWTToken(user);

    expect(typeof accessToken).toBe("string");
  });

  it("should throw an error if user details are missing", () => {
    const user = { email: "test@example.com" };

    expect(async () => await generateJWTToken(user)).rejects.toThrow(
      "User ID is required to generate a token"
    );
  });

  it("should generate a token with correct expiration time", async () => {
    const user = { userId: "123", email: "test@example.com" };
    const { accessToken } = await generateJWTToken(user);

    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET_KEY as string
    ) as jwt.JwtPayload;

    const expiresIn = 3600;
    const currentTime = Math.floor(Date.now() / 1000);
    expect(decoded.exp).toBeGreaterThanOrEqual(currentTime + expiresIn - 10);
    expect(decoded.exp).toBeLessThanOrEqual(currentTime + expiresIn + 10);
  });
});

// Test for organsiation access controls
describe("Organisation Access Control", () => {
  let accessToken: string;
  let orgId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password",
      },
    });

    const org = await prisma.organisation.create({
      data: {
        name: "John's Organisation",
        description: "A test organisation",
        users: {
          create: { userId: user.userId },
        },
      },
    });

    const tokenData = await generateJWTToken({
      userId: user.userId,
      email: user.email,
    });

    accessToken = tokenData.accessToken;
    orgId = org.orgId;
  });

  // it("should not allow access to organisations the user does not belong to", async () => {
  //   const otherUser = await prisma.user.create({
  //     data: {
  //       firstName: "Jane",
  //       lastName: "Doe",
  //       email: "john1@example.com",
  //       password: "password",
  //     },
  //   });

  //   const otherToken = await generateJWTToken({
  //     userId: otherUser.userId,
  //     email: otherUser.email,
  //   });

  //   const response = await request(app)
  //     .get(`/api/organisations/${orgId}`)
  //     .set("Authorization", `Bearer ${otherToken}`);

  //   console.log(response.body);
  //   expect(response.status).toBe(403);
  //   expect(response.body.message).toBe("Access denied");
  // });
});
