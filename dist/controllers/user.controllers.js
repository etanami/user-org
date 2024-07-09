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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.getUser = getUser;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const generateToken_1 = require("../middlewares/generateToken");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
function registerUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { firstName, lastName, email, password, phone } = req.body;
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
            const hashedPassword = yield bcrypt_1.default.hash(password, saltRounds);
            // create new user
            const user = yield prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    phone,
                },
            });
            const organisation = yield prisma.organisation.create({
                data: {
                    name: `${firstName}'s Organisation`,
                    users: {
                        create: {
                            userId: user.userId,
                        },
                    },
                }
            });
            // generate JWT token
            const token = yield (0, generateToken_1.generateJWTToken)(user);
            const accessToken = token.accessToken;
            return res.status(201).json({
                status: "success",
                message: "Registration successful",
                data: {
                    accessToken,
                    user: {
                        userId: user.userId,
                        firstName,
                        lastName,
                        email,
                        phone,
                    },
                },
            });
        }
        catch (err) {
            return res.status(400).json({
                status: "Bad request",
                message: "Registration unsuccessful",
                statusCode: 400,
            });
        }
    });
}
function loginUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { email, password } = req.body;
        try {
            // find user by mail
            const user = yield prisma.user.findUnique({
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
            if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
                return res.status(401).json({
                    status: "Bad request",
                    message: "Authentication failed",
                    statusCode: "401",
                });
            }
            // generate JWT token
            const token = yield (0, generateToken_1.generateJWTToken)(user);
            const accessToken = token.accessToken;
            return res.status(200).json({
                status: "success",
                message: "Login successful",
                data: {
                    accessToken,
                    user: {
                        userId: user.userId,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email,
                        phone: user.phone,
                    },
                },
            });
        }
        catch (err) {
            return res.status(401).json({
                status: "Bad request",
                message: "Authentication failed",
                statusCode: 401,
            });
        }
    });
}
function getUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.params;
        try {
            const user = yield prisma.user.findUnique({
                where: {
                    userId: id,
                },
                select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                },
            });
            if (!user) {
                return res.status(404).json({
                    status: "Not found",
                    message: "User doesn't exist",
                    statusCode: "404",
                });
            }
            return res.status(200).json({
                status: "success",
                message: "User found",
                data: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                },
            });
        }
        catch (err) {
            return res.status(400).json({
                status: "Bad request",
                message: "Error",
                statusCode: "400",
            });
        }
    });
}
