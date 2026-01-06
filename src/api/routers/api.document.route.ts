

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
    this.router.get("/document/type/:document", this.controller.getDocumentType);
    this.router.post("/document/event/:document", this.controller.runEventScript);
    this.router.get("/document/:document", this.controller.getDocuments);
    this.router.get("/document/:document/:id", this.controller.getDocument);
    this.router.post("/document/:document", this.controller.createDocument);
    this.router.put("/document/:document/:id", this.controller.updateDocument);
    this.router.put("/document/:document/:id", this.controller.updateDocument);
    this.router.put("/document/custom/:module/:method", this.controller.runCustomScript);
  }

}


