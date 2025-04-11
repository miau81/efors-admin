
import * as jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { appConfigs } from "../configs/api.config";



export class JWTService {

    private jwtConfig = appConfigs.jwt;

    async hashPassword(password: string) {
        return await Bun.password.hash(password);
    }

    async comparePassword(password: string, hashed: string) {
        return await Bun.password.verify(password, hashed);
    }

    sign(id: string) {
        const token = jwt.sign({ id: id }, this.jwtConfig['JWT_PASS'], { expiresIn: this.jwtConfig['JWT_EXP'] as any });
        const refreshToken = jwt.sign({ id: id }, this.jwtConfig['JWT_PASS'], { expiresIn: this.jwtConfig['JWT_REFRESH_EXP'] as any });
        return { token, refreshToken };
    }

    verifyToken(token: string) {
        try {
            const decoded: any = jwt.verify(token, this.jwtConfig['JWT_PASS']);
            return decoded;
        } catch (error: any) {
            let errorMessage;
            switch (error.message) {
                case "jwt expired":
                    errorMessage = "Authorization token is expired.";
                    throw new UnauthorizedException(errorMessage, "TOKEN_EXPIRED");
                case "jwt must be provided":
                    errorMessage = "Authorization token is required.";
                    throw new UnauthorizedException(errorMessage, "TOKEN_IS_REQUIRED");
                default:
                    errorMessage = "Invalid authorization token.";
                    throw new UnauthorizedException(errorMessage, "INVALID_TOKEN");
            }

        }


    }




}


