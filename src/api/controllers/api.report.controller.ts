import { NextFunction, Response } from "express";
import { SRequest } from "../interfaces/api.route.interface";
import { ApiReportService } from "../services/api.report.service";
import { ConvertUtil } from "../utils/convert";


export class ApiReportController {
    private reportService = new ApiReportService();
    private convertUtil = new ConvertUtil();

    public generateReport = async (req: SRequest, res: Response, next: NextFunction) => {
        // req.mysqlConn = await getConnenctionPoolFromStorage();
        // req.mysqlConn.beginTransaction();
        // try {

        //     const params = this.convertUtil.convertRequestToApiParam(req);
        //     const body = params.body;
        //     const data = await this.reportService.generateReport(params, body, req.mysqlConn);
        //     req.mysqlConn.commit();


        //     res.setHeader('Content-Type', data.contentType);
        //     res.setHeader('Content-Disposition', `inline; filename=${data.fileName}`);
        //     res.end(data.buffer)

        //     // res.status(200).json(data);
        // } catch (error) {
        //     req.mysqlConn.rollback();
        //     next(error);
        // } finally {
        //     req.mysqlConn.release();
        // }

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

