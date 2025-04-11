

import { NextFunction, Response } from "express";
import { connectionPool } from "../databases";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { ApiRequestMethod, AuthURL } from "../interfaces/api.enum";
import { SRequest } from "../interfaces/api.route.interface";
import { ApiUserService } from "../services/api.user.service";
import { ApiParam } from "../interfaces/api.main.interface";
import { ConvertUtil } from "../utils/convert";
import { ApiDocumentService } from "../services/api.document.service";

export class ApiUserController {


    private userService = new ApiUserService();
    private convertUtil = new ConvertUtil();
    private documentService = new ApiDocumentService();


    public login = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            const isAdmin = (req.authURL == AuthURL.ADMIN);
            const data = await this.userService.login(req.body, isAdmin, mysqlConn);
            mysqlConn.commit();
            res.status(200).json(data);
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }

    // public loginFirebase = async (req: SRequest, res: Response, next: NextFunction) => {
    //     const mysqlConn: ConnectionAction = await connectionPool();
    //     mysqlConn.beginTransaction();
    //     try {
    //         //To do function
    //         mysqlConn.commit();
    //         res.status(200).json();
    //     } catch (error) {
    //         mysqlConn.rollback();
    //         next(error);
    //     } finally {
    //         mysqlConn.release();
    //     }
    // }

    public changePassword = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            await this.userService.changePassword(req.body, req.authUser, mysqlConn);
            mysqlConn.commit();
            res.status(200).json();
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }

    public refreshToken = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            await this.userService.refreshToken(req.authUser);
            mysqlConn.commit();
            res.status(200).json();
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }



    // public forgotPassword = async (req: SRequest, res: Response, next: NextFunction) => {
    //     const mysqlConn: ConnectionAction = await connectionPool();
    //     mysqlConn.beginTransaction();
    //     try {
    //         await this.userService.forgotPassword(req.body, req.isAdmin, req.language, mysqlConn);
    //         mysqlConn.commit();
    //         res.status(200).json();
    //     } catch (error) {
    //         mysqlConn.rollback();
    //         next(error);
    //     } finally {
    //         mysqlConn.release();
    //     }
    // }

    // public resetPassword = async (req: SRequest, res: Response, next: NextFunction) => {
    //     const mysqlConn: ConnectionAction = await connectionPool();
    //     mysqlConn.beginTransaction();
    //     try {
    //         await this.userService.resetPassword(req.body, mysqlConn);
    //         mysqlConn.commit();
    //         res.status(200).json();
    //     } catch (error) {
    //         mysqlConn.rollback();
    //         next(error);
    //     } finally {
    //         mysqlConn.release();
    //     }
    // }

    // public authRegister = async (req: SRequest, res: Response, next: NextFunction) => {
    //     const mysqlConn: ConnectionAction = await connectionPool();
    //     mysqlConn.beginTransaction();
    //     try {
    //         //To do function
    //         let requestBody = req.body;
    //         requestBody.nickname = `${requestBody.firstName} ${requestBody.lastName}`
    //         const params: ApiParam = {
    //             user: req.authUser,
    //             language: "en",
    //             requestBody: { ...requestBody },
    //             tableName: "user",
    //             method: ApiRequestMethod.CREATE,
    //             authURL: AuthURL.AUTH,
    //         }

    //         const preData = await this.globalService.runExternalScript(params, requestBody, mysqlConn, DocScriptType.PRE_USER_REGISTER)
    //         params.requestBody = { ...preData };
    //         const data = await this.userService.register(params, mysqlConn);
    //         const postData = await this.globalService.runExternalScript(params, data, mysqlConn, DocScriptType.POST_USER_REGISTER)
    //         mysqlConn.commit();
    //         res.status(200).json(postData);
    //     } catch (error) {
    //         mysqlConn.rollback();
    //         next(error);
    //     } finally {
    //         mysqlConn.release();
    //     }
    // }

    public getProfile = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            req.params['docType'] = 'user'
            req.params['byField'] = 'id'
            req.params['byValue'] = req.authUser?.id
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

    public updateProfile = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await connectionPool();
        mysqlConn.beginTransaction();
        try {
            req.params['docType'] = 'user'
            req.params['byField'] = 'id'
            req.params['byValue'] = req.authUser?.id
            const params = this.convertUtil.convertRequestToSaveApiParam(req, ApiRequestMethod.UPDATE);
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

    // public deleteAccount = async (req: SRequest, res: Response, next: NextFunction) => {
    //     const mysqlConn: ConnectionAction = await connectionPool();
    //     mysqlConn.beginTransaction();
    //     try {
    //         const params: ApiParam = {
    //             user: req.authUser,
    //             language: req.language,
    //             byField: "id",
    //             byValue: req.authUser.id,
    //             tableName: "user",
    //             method: ApiRequestMethod.DELETE,
    //             authURL: req.authURL,
    //         }
    //         await this.globalService.runExternalScript(params, null, mysqlConn, DocScriptType.PRE_DELETE);
    //         await this.globalService.delete(params, mysqlConn);
    //         await this.globalService.runExternalScript(params, null, mysqlConn, DocScriptType.POST_DELETE);
    //         mysqlConn.commit();
    //         let emailTemplate = ""
    //         switch (params.authURL) {
    //             case AuthURL.ADMIN:
    //                 emailTemplate = "ADMIN_DELETE_ACCOUNT";
    //                 break;
    //             case AuthURL.AUTH:
    //                 emailTemplate = "AUTH_DELETE_ACCOUNT";
    //                 break;
    //         }
    //         // this.emailService.sendEmail(req.authUser.email, emailTemplate, mysqlConn);
    //         res.status(200).json();
    //     } catch (error) {
    //         mysqlConn.rollback();
    //         next(error);
    //     } finally {
    //         mysqlConn.release();
    //     }

    // }

    // public uploadProfile = async (req: SRequest, res: Response, next: NextFunction) => {
    //     const mysqlConn: ConnectionAction = await connectionPool();
    //     mysqlConn.beginTransaction();
    //     try {
    //         const response= await this.userService.uploadProfile("profile",req.files,req.authUser,mysqlConn);
    //         mysqlConn.commit();
    //         res.status(200).json(response);
    //     } catch (error) {
    //         mysqlConn.rollback();
    //         next(error);
    //     } finally {
    //         mysqlConn.release();
    //     }
    // }

    // public uploadBanner = async (req: SRequest, res: Response, next: NextFunction) => {
    //     const mysqlConn: ConnectionAction = await connectionPool();
    //     mysqlConn.beginTransaction();
    //     try {
    //         const response= await this.userService.uploadProfile("banner",req.files,req.authUser,mysqlConn);
    //         mysqlConn.commit();
    //         res.status(200).json(response);
    //     } catch (error) {
    //         mysqlConn.rollback();
    //         next(error);
    //     } finally {
    //         mysqlConn.release();
    //     }
    // }
}