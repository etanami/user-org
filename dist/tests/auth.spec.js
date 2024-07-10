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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../src/index"));
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
describe("Auth Endpoints", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Cleanup database before tests
        yield prisma.user.deleteMany({});
        yield prisma.organisation.deleteMany({});
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma.$disconnect();
    }));
    describe("POST /auth/register", () => {
        it("Should Register User Successfully with Default Organisation", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(index_1.default).post("/auth/register").send({
                firstName: "John",
                lastName: "Doe",
                email: "john@example.com",
                password: "password123",
            });
            expect(response.status).toBe(201);
            expect(response.body.data).toHaveProperty("user");
            expect(response.body.data).toHaveProperty("accessToken");
            expect(response.body.data.user).toHaveProperty("defaultOrganisation");
            expect(response.body.data.user.defaultOrganisation.name).toBe("John's Organisation");
        }));
        it("Should Log the user in successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const loginResponse = yield (0, supertest_1.default)(index_1.default).post("/auth/login").send({
                email: "john@example.com",
                password: "password123",
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body).toHaveProperty("accessToken");
        }));
        it("Should Fail If Required Fields Are Missing", () => __awaiter(void 0, void 0, void 0, function* () {
            const missingFirstNameResponse = yield (0, supertest_1.default)(index_1.default)
                .post("/auth/register")
                .send({
                lastName: "Doe",
                email: "john2@example.com",
                password: "password123",
            });
            expect(missingFirstNameResponse.status).toBe(422);
            expect(missingFirstNameResponse.body.message).toContain("firstName is required");
            const missingLastNameResponse = yield (0, supertest_1.default)(index_1.default)
                .post("/auth/register")
                .send({
                firstName: "John",
                email: "john2@example.com",
                password: "password123",
            });
            expect(missingLastNameResponse.status).toBe(422);
            expect(missingLastNameResponse.body.message).toContain("lastName is required");
            const missingEmailResponse = yield (0, supertest_1.default)(index_1.default)
                .post("/auth/register")
                .send({
                firstName: "John",
                lastName: "Doe",
                password: "password123",
            });
            expect(missingEmailResponse.status).toBe(422);
            expect(missingEmailResponse.body.message).toContain("email is required");
            const missingPasswordResponse = yield (0, supertest_1.default)(index_1.default)
                .post("/auth/register")
                .send({
                firstName: "John",
                lastName: "Doe",
                email: "john2@example.com",
            });
            expect(missingPasswordResponse.status).toBe(422);
            expect(missingPasswordResponse.body.message).toContain("password is required");
        }));
        it("Should Fail if there’s Duplicate Email or UserID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response1 = yield (0, supertest_1.default)(index_1.default).post("/auth/register").send({
                firstName: "Jane",
                lastName: "Doe",
                email: "jane@example.com",
                password: "password123",
            });
            expect(response1.status).toBe(201);
            const response2 = yield (0, supertest_1.default)(index_1.default).post("/auth/register").send({
                firstName: "Jane",
                lastName: "Doe",
                email: "jane@example.com",
                password: "password123",
            });
            expect(response2.status).toBe(422);
            expect(response2.body.message).toContain("Email already exists");
        }));
    });
});
