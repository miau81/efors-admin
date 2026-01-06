import type { NextFunction, Response } from "express";
import { SRequest } from "../interfaces/api.route.interface";
import { ApiDocumentService } from "../services/api.document.service";
import { core } from "../core/core";


export class ApiDocumentController {

    private documentService = new ApiDocumentService();

    public getDocuments = async (req: SRequest, res: Response, next: NextFunction) => {
        return core.beingRequest(req, res, next, this.documentService.getDocuments.bind(req));
    }

    public getDocument = async (req: SRequest, res: Response, next: NextFunction) => {
        return core.beingRequest(req, res, next, this.documentService.getDocument.bind(req));
    }

    public getDocumentType = async (req: SRequest, res: Response, next: NextFunction) => {
        return core.beingRequest(req, res, next, this.documentService.getDocumentType.bind(req));
    }

    public createDocument = async (req: SRequest, res: Response, next: NextFunction) => {
        return core.beingRequest(req, res, next, this.documentService.createDocument.bind(req));
    }

    public updateDocument = async (req: SRequest, res: Response, next: NextFunction) => {
        return core.beingRequest(req, res, next, this.documentService.updateDocument.bind(req));
    }

    public runEventScript = async (req: SRequest, res: Response, next: NextFunction) => {
         return core.beingRequest(req, res, next, this.documentService.runEventScript.bind(req));
    }

    public runCustomScript = async (req: SRequest, res: Response, next: NextFunction) => {
        return core.beingRequest(req, res, next, this.documentService.runCustomScript.bind(req));
    }
}