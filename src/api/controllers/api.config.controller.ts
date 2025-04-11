import type { NextFunction, Response } from "express";
import { SRequest } from "../interfaces/api.route.interface";
import { ApiConfigService } from "../services/api.config.service";

export class ApiConfigController {

    private configService = new ApiConfigService();


    public getConfig = async (req: SRequest, res: Response, next: NextFunction) => {
        try {
            const type= req.params['type'];
            const docType= req.params['docType'];
            const data = await this.configService.getConfig(type,docType);
            res.status(200).send(data)
            // next();
        } catch (error) {
            next(error);
        }
    }
}