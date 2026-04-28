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
exports.checkAuth = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jsonwebtoken_1 = require("jsonwebtoken");
const env_1 = require("../config/env");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const jwt_1 = require("../utils/jwt");
const checkAuth = (...authRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Extract token
        const rawToken = req.headers.authorization || req.cookies.accessToken;
        if (!rawToken) {
            throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "No Token Received");
        }
        const accessToken = rawToken.startsWith("Bearer ")
            ? rawToken.split(" ")[1]
            : rawToken;
        // 2. Verify token — remap JWT-specific errors to AppError
        let verifiedToken;
        try {
            verifiedToken = (0, jwt_1.verifyToken)(accessToken, env_1.envVars.JWT_ACCESS_SECRET);
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Token has expired");
            }
            if (err instanceof jsonwebtoken_1.JsonWebTokenError) {
                throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid token");
            }
            throw err; // unexpected error — re-throw as-is
        }
        // 3. Check user status
        const user = yield user_model_1.User.findOne({ email: verifiedToken.email }).lean();
        if (!user) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User does not exist");
        }
        if (!user.isVerified) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User is not verified");
        }
        if (user.isActive === user_interface_1.IsActive.BLOCKED || user.isActive === user_interface_1.IsActive.INACTIVE) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `User is ${user.isActive}`);
        }
        if (user.isDeleted) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User account has been deleted");
        }
        // 4. Check role
        if (authRoles.length && !authRoles.includes(verifiedToken.role)) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not permitted to access this route");
        }
        req.user = verifiedToken;
        next();
    }
    catch (error) {
        // Only log truly unexpected errors, not routine auth failures
        if (!(error instanceof AppError_1.default)) {
            console.error("[checkAuth] Unexpected error:", error);
        }
        next(error);
    }
});
exports.checkAuth = checkAuth;
