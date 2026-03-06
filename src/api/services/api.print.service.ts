import { core } from "../core/core";
import { SRequest } from "../interfaces/api.route.interface";

import ejs from "ejs";


export class ApiPrintService {


    readonly printFilePath = `${import.meta.dir}/../../../api/print_format`;

    async getLetterHead(req: SRequest) {
        const company = await core.getDocument(req, "company", req.com!);
        const templateFile = `${this.printFilePath}/letterhead.ejs`;
        const html = await ejs.renderFile(templateFile, { company });
        return {
            company: company,
            html: html
        }
    }

    async renderPrintFile(req: SRequest, document: string, data: any, templateFile: string, withLetterHead: boolean = true) {
        const scriptFile = templateFile.split('.');
        data = await data;
        try {
            const path = new URL(`${this.printFilePath}/${document}/${templateFile}.ts`, import.meta.url).href;
            const imp = await import(/* @vite-ignore */ path);
            if (imp.beforePrint) {
                data = await imp.beforePrint(req, data);
            }
        } catch (error) { console.error(error) }

        let letterHead;
        if (withLetterHead) {
            letterHead = await this.getLetterHead(req);
        }
        data.letterHead = letterHead;

        let html: string = await ejs.renderFile(`${this.printFilePath}/${document}/${templateFile}.ejs`, data);

        return {
            letterHead: letterHead,
            html: html
        }
    }




}
