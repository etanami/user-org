import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

interface AuthRequest extends Request {
  user?: any;
}

const prisma = new PrismaClient();

export async function getAllUserOrganisations(req: AuthRequest, res: Response) {
  const userId = req.user?.userId;

  try {
    const organisations = await prisma.organisation.findMany({
      where: {
        users: {
          some: {
            userId,
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
    return res.status(401).json({
      status: "Bad request",
      message: "Client error",
      statusCode: 401,
    });
  }
}

export async function getOneUserOrganisation(req: AuthRequest, res: Response) {
  const { orgId } = req.params;
  const userId = req.user?.userId;

  if (!orgId) {
    return res.status(400).json({
      status: "Not found",
      message: "Organisation ID is required",
    });
  }

  try {
    const userOrganisation = await prisma.userOrganisation.findFirst({
      where: {
        userId,
        orgId,
      },
    });

    if (!userOrganisation) {
      return res.status(403).json({
        status: "Forbidden",
        message: "Access denied",
        statusCode: "403",
      });
    }

    const organisation = await prisma.organisation.findUnique({
      where: {
        orgId,
      },
      include: {
        users: true,
      },
    });

    if (!organisation) {
      return res.status(404).json({
        status: "Not found",
        message: "Organisation doesn't exist",
        statusCode: "404",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User organisation retrieved successfully",
      data: {
        orgId: organisation.orgId,
        name: organisation.name,
        description: organisation.description,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Bad request",
      statusCode: 400,
    });
  }
}

export async function createOrganisation(req: AuthRequest, res: Response) {
  const { name, description } = req.body;
  const userId = req.user?.userId;

  try {
    // check if organisation name is inputed
    if (!name || typeof name === null) {
      return res.status(422).json({
        name: "Organisation name is required",
      });
    }

    const organisation = await prisma.organisation.create({
      data: {
        name,
        description,
        users: {
          create: {
            userId,
          },
        },
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Organisation created successfully",
      data: organisation,
    });
  } catch (err) {
    return res.status(400).json({
      status: "Bad Request",
      message: "Client error",
      statusCode: 400,
    });
  }
}

export function addUserToAnOrganisation(req: AuthRequest, res: Response) {
  const { orgId } = req.params;
  const loggedUserId = req.user?.userId;
  const { userId } = req.body;

  try {
    // validate if user sent an id
    if (!userId) {
      return res.status(422).json({
        name: "User ID is required",
      });
    }

    // check if organisation exists
    const organisation = prisma.organisation.findUnique({
      where: {
        orgId,
      },
    });

    if (!organisation) {
      return res.status(404).json({
        status: "Not found",
        message: "Organisation doesn't exist",
        statusCode: "404",
      });
    }

    // check if user is part of the orgnanisation
    const userOrganisation = prisma.userOrganisation.findFirst({
      where: {
        userId: loggedUserId,
        orgId,
      },
    });

    if (!userOrganisation) {
      return res.status(403).json({
        status: "Forbidden",
        message: "Access denied",
        statusCode: "403",
      });
    }

    const user = prisma.userOrganisation.create({
      data: {
        userId,
        orgId,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "User added to organisation successfully",
    });
  } catch (err) {
    return res.status(400).json({
      status: "Bad Request",
      message: "Client error",
      statusCode: 400,
    });
  }
}
