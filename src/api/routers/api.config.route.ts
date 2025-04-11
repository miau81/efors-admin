

import { Router } from "express";
import { ApiConfigController } from "../controllers/api.config.controller";
import type { Route } from "../interfaces/api.route.interface";

export class ApiConfigRoute implements Route {
  public router = Router();
  private controller= new ApiConfigController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/admin/config/:type/:docType", this.controller.getConfig);
  }

}
