import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

interface AuthRequest extends Request {
  user?: any;
}

const prisma = new PrismaClient();

export async function getAllUserOrganisations(req: AuthRequest, res: Response) {
  try {
    const organisations = await prisma.organisation.findMany({
      where: {
        users: {
          some: {
            userId: req.user.userId,
          },
        },
      },
      select: {
        orgId: true,
        name: true,
        description: true,
      },
    });

    if (!organisations) {
      return res.status(404).json({
        status: "Not found",
        message: "Organisations don't exist",
        statusCode: "404",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User organisations retrieved successfully",
      data: {
        organisations: organisations.map((organisation) => ({
          orgId: organisation.orgId,
          name: organisation.name,
          description: organisation.description,
        })),
      },
    });
  } catch (err) {
    return res.status(403).json({
      status: "Bad request",
      message: "Client error",
      statusCode: 401,
    });
  }
}
