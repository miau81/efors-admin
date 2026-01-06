import type { NextFunction,Response } from "express";
// import { ApiPermissionService } from "../services/api.permission.service";
import { SRequest } from "../interfaces/api.route.interface";
import { ApiAuthGuardService } from "../services/api.auth-guard.service";

export class AuthGuardController {

    private authGuardService = new ApiAuthGuardService();


    public authorizeCheck = async (req: SRequest, res: Response, next: NextFunction) => {
        try {
            await this.authGuardService.authorizeCheck(req);
            next();
        } catch (error) {
            next(error);
        }
    }

}