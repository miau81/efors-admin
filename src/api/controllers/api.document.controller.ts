import type { NextFunction, Response } from "express";
import { SRequest } from "../interfaces/api.route.interface";
import { ApiDocumentService } from "../services/api.document.service";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { connectionPool } from "../databases";
import { ApiRequestMethod, AuthURL } from "../interfaces/api.enum";
import { ConvertUtil } from "../utils/convert";


export class ApiDocumentController {

    private documentService = new ApiDocumentService();
    private convertUtil = new ConvertUtil();



    public getDocuments = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            const params = this.convertUtil.convertRequestToGetApiParam(req, ApiRequestMethod.GET_LIST);
            const data = await this.documentService.getDocuments(params, mysqlConn);
            mysqlConn.commit();
            res.status(200).json(data);
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }

    public getDocument = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            const params = this.convertUtil.convertRequestToGetApiParam(req, ApiRequestMethod.GET_ONE);
            const data = await this.documentService.getDocument(params, mysqlConn);
            mysqlConn.commit();
            res.status(200).json(data);
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }

    public getDocumentType = async (req: SRequest, res: Response, next: NextFunction) => {
        try {
            const docType = req.params['docType'];
            const data = await this.documentService.getDocumentType(docType);
            res.status(200).send(data)
            // next();
        } catch (error) {
            next(error);
        }
    }

    public createDocument = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            const params= this.convertUtil.convertRequestToSaveApiParam(req,ApiRequestMethod.CREATE);
            const data = await this.documentService.create(params, mysqlConn);
            mysqlConn.commit();
            res.status(200).json(data);
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }

    public updateDocument = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            const params= this.convertUtil.convertRequestToSaveApiParam(req,ApiRequestMethod.UPDATE);
            const data = await this.documentService.update(params, mysqlConn);
            mysqlConn.commit();
            res.status(200).json(data);
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }

   
}