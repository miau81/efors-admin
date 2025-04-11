

import { Router } from "express";
import { ApiPermissionController } from "../controllers/api.permission.controller";
import type { Route } from "../interfaces/api.route.interface";

export class ApiPermissionRoute implements Route {
  public router = Router();
  private controller= new ApiPermissionController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.all("/*", this.controller.authorizeCheck);
  }

}
