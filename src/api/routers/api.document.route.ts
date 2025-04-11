

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
    this.router.get("/admin/document/type/:docType", this.controller.getDocumentType);
    this.router.get("/:authURL/document/:docType", this.controller.getDocuments);
    this.router.get("/:authURL/document/:docType/:byField/:byValue", this.controller.getDocument);
    this.router.post("/:authURL/document/:docType", this.controller.createDocument);
    this.router.put("/:authURL/document/:docType/:byField/:byValue", this.controller.updateDocument);

  }

}
