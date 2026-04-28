import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JsonWebTokenError, JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { IsActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

export const checkAuth = (...authRoles: string[]) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // 1. Extract token
            const rawToken = req.headers.authorization || req.cookies.accessToken;
            if (!rawToken) {
                throw new AppError(httpStatus.UNAUTHORIZED, "No Token Received");
            }

            const accessToken = rawToken.startsWith("Bearer ")
                ? rawToken.split(" ")[1]
                : rawToken;

            // 2. Verify token — remap JWT-specific errors to AppError
            let verifiedToken: JwtPayload;
            try {
                verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload;
            } catch (err) {
                if (err instanceof TokenExpiredError) {
                    throw new AppError(httpStatus.UNAUTHORIZED, "Token has expired");
                }
                if (err instanceof JsonWebTokenError) {
                    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
                }
                throw err; // unexpected error — re-throw as-is
            }

            // 3. Check user status
            const user = await User.findOne({ email: verifiedToken.email }).lean();

            if (!user) {
                throw new AppError(httpStatus.NOT_FOUND, "User does not exist");
            }
            if (!user.isVerified) {
                throw new AppError(httpStatus.FORBIDDEN, "User is not verified");
            }
            if (user.isActive === IsActive.BLOCKED || user.isActive === IsActive.INACTIVE) {
                throw new AppError(httpStatus.FORBIDDEN, `User is ${user.isActive}`);
            }
            if (user.isDeleted) {
                throw new AppError(httpStatus.FORBIDDEN, "User account has been deleted");
            }

            // 4. Check role
            if (authRoles.length && !authRoles.includes(verifiedToken.role)) {
                throw new AppError(httpStatus.FORBIDDEN, "You are not permitted to access this route");
            }

            req.user = verifiedToken;
            next();

        } catch (error) {
            // Only log truly unexpected errors, not routine auth failures
            if (!(error instanceof AppError)) {
                console.error("[checkAuth] Unexpected error:", error);
            }
            next(error);
        }
    };