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



    public getDocumentList = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            const params = this.convertUtil.convertRequestToGetApiParam(req, ApiRequestMethod.GET_LIST);
            const data = await this.documentService.getDocumentList(params, mysqlConn);
            mysqlConn.commit();
            res.status(200).json(data);
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }

    public getSingleDocument = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            const params = this.convertUtil.convertRequestToGetApiParam(req, ApiRequestMethod.GET_ONE);
            const data = await this.documentService.getSingleDocument(params, mysqlConn);
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

        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            const document = req.params['document'];
            const data = await this.documentService.getDocumentType(document, mysqlConn, req.sys, req.com, req.language);
            mysqlConn.commit();
            res.status(200).json(data);
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }

    public createDocument = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            const params = this.convertUtil.convertRequestToSaveApiParam(req, ApiRequestMethod.CREATE);
            const data = await this.documentService.createDocument(params, mysqlConn);
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
            const params = this.convertUtil.convertRequestToSaveApiParam(req, ApiRequestMethod.UPDATE);
            const data = await this.documentService.updateDocument(params, mysqlConn);
            mysqlConn.commit();
            res.status(200).json(data);
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }

    public runEventScript = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            const params = this.convertUtil.convertRequestToApiParam(req, ApiRequestMethod.GET);
            const data = await this.documentService.runEventScript(params, mysqlConn);
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