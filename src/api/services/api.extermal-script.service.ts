import { ConnectionAction } from "../interfaces/api.db.interface";
import { ApiParam } from "../interfaces/api.main.interface";
import { logger } from "../utils/logger";
import { ApiPrintService } from "./api.print.service";

export class ExternalScriptService {

    readonly printService = new ApiPrintService();

    async importDocTypeEventFile(docType: string) {
        const path = new URL(`../../../api/events/${docType}.event.ts`, import.meta.url).href;
        return await import(/* @vite-ignore */ path);
    }

    async runEventScript(params: ApiParam, mysqlConn: ConnectionAction) {
        try {
            const body = params.body;
            const imp = await this.importDocTypeEventFile(params.tableName).catch(err=>console.log(err));
            switch (body.action) {
                case "onChange":
                    if (imp?.onChange) {
                        return imp.onChange(params, mysqlConn);
                    }
                    break;
                case "onPrint":
                    let data = params.body.data;
                    if (imp?.onPrint) {
                        data = imp.onPrint(params, mysqlConn);
                    }

                    data = await this.printService.renderPrintFile(params, data, body.format, mysqlConn, true);
                    return data;

            }
        } catch (error) {
            logger.error('Error loading event script:', error);

        }
        return {};
    }
}