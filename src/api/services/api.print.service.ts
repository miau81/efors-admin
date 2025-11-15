import { ConnectionAction } from "../interfaces/api.db.interface";
import { ApiParam } from "../interfaces/api.main.interface";
import { ApiGlobalService } from "./api.global.service";
import ejs from "ejs";


export class ApiPrintService {

    readonly globalService = new ApiGlobalService();
    readonly printFilePath = `${import.meta.dir}/../../../api/print_format`;

    async getLetterHead(companyId: string, user: any, mysqlConn: ConnectionAction) {
        const company = await this.globalService.getCompany(companyId, user, mysqlConn);
        const templateFile = `${this.printFilePath}/letterhead.ejs`;
        const html = await ejs.renderFile(templateFile, { company });
        return {
            company: company,
            html: html
        }
    }

    async renderPrintFile(params: ApiParam, data: any, templateFile: string, mysqlConn: ConnectionAction, withLetterHead: boolean = true) {
        const scriptFile = templateFile.split('.');
        data = await data;
        try {
            const path = new URL(`${this.printFilePath}/${params.tableName}/${templateFile}.ts`, import.meta.url).href;
            const imp = await import(/* @vite-ignore */ path);
            if (imp.beforePrint) {
                data = await imp.beforePrint(params, data, mysqlConn);
            }
        } catch (error) { console.error(error) }

        let letterHead;
        if (withLetterHead) {
            letterHead = await this.getLetterHead(params.com!, params.user, mysqlConn);
        }
        data.letterHead = letterHead;

        let html: string = await ejs.renderFile(`${this.printFilePath}/${params.tableName}/${templateFile}.ejs`, data);
        
        return {
            letterHead: letterHead,
            html: html
        }
    }




}
