

import { Router } from "express";
import { AuthGuardController } from "../controllers/api.auth-guard.controller";
import type { Route } from "../interfaces/api.route.interface";

export class ApiAuthGuardRoute implements Route {
  public router = Router();
  private controller= new AuthGuardController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.all("/*", this.controller.authorizeCheck);
  }

}
