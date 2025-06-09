import { ConnectionAction } from "../interfaces/api.db.interface";
import { ApiParam } from "../interfaces/api.main.interface";
import { ApiGlobalService } from "./api.global.service";
import ejs from "ejs";

export class ApiPrintService {

    readonly globalService = new ApiGlobalService();
    readonly printFilePath = `${import.meta.dir}/../../../api/print`;

    async getLetterHead(companyId: string, user: any, mysqlConn: ConnectionAction) {
        const company = await this.globalService.getCompany(companyId, user, mysqlConn);
        const templateFile = `${this.printFilePath}/letterhead.ejs`;
        const html = await ejs.renderFile(templateFile, {company});
        return {
            company: company,
            html: html
        }
    }

    async renderPrintFile(params: ApiParam, data: any, templateFile: string, mysqlConn: ConnectionAction, withLetterHead: boolean = true) {
        let html: string = await ejs.renderFile(`${this.printFilePath}/${templateFile}`, data);
        let letterHead;
        if (withLetterHead) {
            letterHead = await this.getLetterHead(params.com!, params.user, mysqlConn);
            html = letterHead.html + html;
        }
        return {
            letterHead: letterHead,
            html: html
        }
    }


}
