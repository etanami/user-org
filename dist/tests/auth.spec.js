"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const client_1 = require("@prisma/client");
const jwt = __importStar(require("jsonwebtoken"));
const generateToken_1 = require("../middlewares/generateToken");
const prisma = new client_1.PrismaClient();
// Test for token generation
describe("Token Generation", () => {
    it("should generate a token with an access token", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = { userId: "123", email: "test@example.com" };
        const { accessToken } = yield (0, generateToken_1.generateJWTToken)(user);
        expect(typeof accessToken).toBe("string");
    }));
    it("should throw an error if user details are missing", () => {
        const user = { email: "test@example.com" };
        expect(() => __awaiter(void 0, void 0, void 0, function* () { return yield (0, generateToken_1.generateJWTToken)(user); })).rejects.toThrow("User ID is required to generate a token");
    });
    it("should generate a token with correct expiration time", () => __awaiter(void 0, void 0, void 0, function* () {
        const user = { userId: "123", email: "test@example.com" };
        const { accessToken } = yield (0, generateToken_1.generateJWTToken)(user);
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);
        const expiresIn = 3600;
        const currentTime = Math.floor(Date.now() / 1000);
        expect(decoded.exp).toBeGreaterThanOrEqual(currentTime + expiresIn - 10);
        expect(decoded.exp).toBeLessThanOrEqual(currentTime + expiresIn + 10);
    }));
});
// Test for organsiation access controls
describe("Organisation Access Control", () => {
    let accessToken;
    let orgId;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prisma.user.create({
            data: {
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "password",
            },
        });
        const org = yield prisma.organisation.create({
            data: {
                name: "John's Organisation",
                description: "A test organisation",
                users: {
                    create: { userId: user.userId },
                },
            },
        });
        const tokenData = yield (0, generateToken_1.generateJWTToken)({
            userId: user.userId,
            email: user.email,
        });
        accessToken = tokenData.accessToken;
        orgId = org.orgId;
    }));
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
