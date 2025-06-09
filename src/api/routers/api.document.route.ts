

import { Router } from "express";

import type { Route } from "../interfaces/api.route.interface";
import { ApiDocumentController } from "../controllers/api.document.controller";

export class ApiDocumentRoute implements Route {
  public router = Router();
  private controller = new ApiDocumentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/admin/document/type/:document", this.controller.getDocumentType);
    this.router.post("/admin/document/event/:document", this.controller.runEventScript);
    this.router.get("/:authURL/document/:document", this.controller.getDocumentList);
    this.router.get("/:authURL/document/:document/:byField/:byValue", this.controller.getSingleDocument);
    this.router.post("/:authURL/document/:document", this.controller.createDocument);
    this.router.put("/:authURL/document/:document/:byField/:byValue", this.controller.updateDocument);

  }

}
