import { NextFunction, Response } from "express";
import { SRequest } from "../interfaces/api.route.interface";
import { ApiReportService } from "../services/api.report.service";
import { ConnectionPool } from "../databases";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { ApiRequestMethod } from "../interfaces/api.enum";
import { ConvertUtil } from "../utils/convert";

export class ApiReportController {
    private reportService = new ApiReportService();
    private convertUtil = new ConvertUtil();

    public generateReport = async (req: SRequest, res: Response, next: NextFunction) => {
        const mysqlConn: ConnectionAction = await ConnectionPool();
        mysqlConn.beginTransaction();
        try {

            const params = this.convertUtil.convertRequestToApiParam(req, ApiRequestMethod.GET);
            const body = params.body;
            const data = await this.reportService.generateReport(params, body, mysqlConn);
            mysqlConn.commit();


            res.setHeader('Content-Type', data.contentType);
            res.setHeader('Content-Disposition', `inline; filename=${data.fileName}`);
            res.end(data.buffer)

            // res.status(200).json(data);
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }

    }

    public htmlToFile = async (req: SRequest, res: Response, next: NextFunction) => {
        try {
            const body = req.body;
            const data = await this.reportService.generateReportFile(body.html, body.type, body.fileName);

           res.setHeader('Content-Type', data.contentType);
            res.setHeader('Content-Disposition', `inline; filename=${data.fileName}`);
            res.end(data.buffer)

        } catch (error) {
            next(error);
        }
    }
}

