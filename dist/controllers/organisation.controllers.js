"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUserOrganisations = getAllUserOrganisations;
exports.getOneUserOrganisation = getOneUserOrganisation;
exports.createOrganisation = createOrganisation;
exports.addUserToAnOrganisation = addUserToAnOrganisation;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function getAllUserOrganisations(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        try {
            const organisations = yield prisma.organisation.findMany({
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
        }
        catch (err) {
            return res.status(401).json({
                status: "Bad request",
                message: "Client error",
                statusCode: 401,
            });
        }
    });
}
function getOneUserOrganisation(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { orgId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!orgId) {
            return res.status(400).json({
                status: "Not found",
                message: "Organisation ID is required",
            });
        }
        try {
            const userOrganisation = yield prisma.userOrganisation.findFirst({
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
            const organisation = yield prisma.organisation.findUnique({
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
        }
        catch (err) {
            console.log(err);
            return res.status(400).json({
                message: "Bad request",
                statusCode: 400,
            });
        }
    });
}
function createOrganisation(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const { name, description } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        try {
            // check if organisation name is inputed
            if (!name || typeof name === null) {
                return res.status(400).json({
                    name: "Organisation name is required",
                });
            }
            const organisation = yield prisma.organisation.create({
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
        }
        catch (err) {
            return res.status(400).json({
                status: "Bad Request",
                message: "Client error",
                statusCode: 400,
            });
        }
    });
}
function addUserToAnOrganisation(req, res) {
    var _a;
    const { orgId } = req.params;
    const loggedUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
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
    }
    catch (err) {
        return res.status(400).json({
            status: "Bad Request",
            message: "Client error",
            statusCode: 400,
        });
    }
}
