import type { NextFunction,Response } from "express";
// import { ApiPermissionService } from "../services/api.permission.service";
import { SRequest } from "../interfaces/api.route.interface";
import { ApiPermissionService } from "../services/api.permission.service";

export class ApiPermissionController {

    private permissionService = new ApiPermissionService();


    public authorizeCheck = async (req: SRequest, res: Response, next: NextFunction) => {
        try {
            // await this.permissionService.authorizeCheck(req);
            next();
        } catch (error) {
            next(error);
        }
    }

}