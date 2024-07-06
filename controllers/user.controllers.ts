import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function RegisterUser(req: Request, res: Response) {
  const { firstName, lastName, email, password, phone } = req.body;

  // validate fields from user
  if (!firstName || !lastName || !email || !password || !phone) {
    return res.status(422).json({
      errors: [
        {
          field: "Required",
          message: "Missing required field!",
        },
      ],
    });
  }

  try {
    // hash password with bcrypt before creating in db
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

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

    return res.status(201).json({
      status: "success",
      message: "Registration successful",
      data: {
        accessToken: "token",
        user: {
          userId: "id",
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
