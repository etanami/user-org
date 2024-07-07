import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { generateJWTToken } from "../middlewares/generateToken";

dotenv.config();

export type Register = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
};

export type Login = {
  email: string;
  password: string;
};

const prisma = new PrismaClient();

export async function RegisterUser(req: Request, res: Response) {
  const { firstName, lastName, email, password, phone }: Register = req.body;

  // validate fields from user
  if (!firstName || !lastName || !email || !password || !phone) {
    return res.status(422).json({
      errors: [
        { field: "firstName", message: "First name is required" },
        { field: "lastName", message: "Last name is required" },
        { field: "email", message: "Email is required" },
        { field: "password", message: "Password is required" },
      ],
    });
  }

  try {
    // hash password with bcrypt before creating in db
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // create new user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        organisations: {
          create: {
            name: `${firstName}'s Organisation`,
          },
        },
      },
    });

    // generate JWT token
    const token = generateJWTToken();

    return res.status(201).json({
      status: "success",
      message: "Registration successful",
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName,
          lastName,
          email,
          phone,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      status: "Bad request",
      message: "Registration unsuccessful",
      statusCode: 400,
    });
  }
}

export async function LoginUser(req: Request, res: Response) {
  const { email, password }: Login = req.body;

  try {
    // find user by mail
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        password: true,
        phone: true,
      },
    });

    // validate user password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: "Bad request",
        message: "Authentication failed",
        statusCode: "401",
      });
    }

    // generate JWT token
    const token = generateJWTToken();

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        accessToken: token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email,
          phone: user.phone,
        },
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      status: "Bad request",
      message: "Authentication failed",
      statusCode: 401,
    });
  }
}
