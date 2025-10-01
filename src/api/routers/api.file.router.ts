

import { Router } from "express";

import type { Route } from "../interfaces/api.route.interface";
import { ApiFileController } from "../controllers/api.file.controller";

export class ApiFileRoute implements Route {
  public router = Router();
  private controller= new ApiFileController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/public/file/generate-pdf", this.controller.generatePdf);
  }

}
