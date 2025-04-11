

import { Router } from "express";
import multer from "multer";
import type { Route } from "../interfaces/api.route.interface";
import { ApiUserController } from "../controllers/api.user.controller";

export class ApiUserRoute implements Route {
  public router = Router();
  private controller = new ApiUserController();
  private fileUpload = multer();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/:authUrl/login", this.controller.login);
    // this.router.post("/auth/login/firebase", this.controller.loginFirebase);
    this.router.post("/auth/password", this.controller.changePassword);
    this.router.get("/auth/refresh_token", this.controller.refreshToken);
    // this.router.post("/auth/password/forgot", this.controller.forgotPassword);
    // this.router.post("/auth/password/reset", this.controller.resetPassword);
    // this.router.post("/auth/register", this.controller.authRegister);
    this.router.get("/:authUrl/profile", this.controller.getProfile);
    this.router.put("/:authUrl/profile", this.controller.updateProfile)
    // this.router.delete("/auth/account/delete", this.controller.deleteAccount);
    // this.router.post("/auth/upload/profile",this.fileUpload.any(), this.controller.uploadProfile);
    // this.router.post("/auth/upload/banner",this.fileUpload.any(), this.controller.uploadBanner);
  }



}