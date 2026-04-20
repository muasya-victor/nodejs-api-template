import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Response, Request, ErrorRequestHandler, NextFunction } from "express";
import type { AuthUser } from "@/types/auth.types.js";
import { AppError } from "@/utils/errors.js";

export const verifyTokenMiddelware = (err: ErrorRequestHandler, 
    req: Request, res: Response, 
    next: NextFunction) : void =>
    {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader || Array.isArray(authHeader)) {
            throw Error("No token provided")
        }

        if (!authHeader.startsWith("Bearer ")) {
            throw Error("Invalid token format")
        }

        const token  = authHeader.split(" ")[1];

        if(!token) throw Error("No token provided")

        try {
            const secret = process.env.JWT_SECRET;

            if (!secret) throw Error("JWT_SECRET is not defined");

            const decoded = jwt.verify(token, secret) 

            req.user = decoded as AuthUser;

            next();  
        } catch (error) {
            throw new AppError("Invalid token", 401);
        }

          
}