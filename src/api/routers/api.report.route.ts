
import { Router } from "express";

import type { Route } from "../interfaces/api.route.interface";
import { ApiReportController } from "../controllers/api.report.controller";

export class ApiReportRoute implements Route {
  public router = Router();
  private controller = new ApiReportController();
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.all("/admin/report/generate-report", this.controller.generateReport);
    this.router.all("/admin/report/html-to-file", this.controller.htmlToFile);
  }

}