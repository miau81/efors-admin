import { SRequest } from "../interfaces/api.route.interface";
import { logger } from "../utils/logger";
import { ApiPrintService } from "./api.print.service";

export class ExternalScriptService {

    readonly printService = new ApiPrintService();

    async importDocTypeEventFile(docType: string) {
        const path = new URL(`../../../api/events/${docType}.event.ts`, import.meta.url).href;
        return  import(/* @vite-ignore */ path);
    }

    async importCustomScriptFile(method: string) {
        const path = new URL(`../../../api/custom-scripts/${method}.ts`, import.meta.url).href;
        return await import(/* @vite-ignore */ path);
    }

    async runEventScript(document: string, req: SRequest) {
        try {
            const body = req.body;
            const imp = await this.importDocTypeEventFile(document).catch(err => console.log(err));
            switch (body.action) {
                case "onChange":
                    if (imp?.onChange) {
                        return await imp.onChange(document, req);
                    }
                    break;
                case "onPrint":
                    let data = body.data;
                    if (imp?.onPrint) {
                        data = imp.onPrint(document, req);
                    }
                    return await this.printService.renderPrintFile(req,document, data, body.format, true);
            }
        } catch (error) {
            logger.error('Error loading event script:', error);
            throw error
        }
        return {};
    }

    async runCustomScript(module: string, method: string, req: SRequest) {
        try {
            const imp = await this.importDocTypeEventFile(module).catch(err => console.log(err));
            if (imp?.[method]) {
                return await imp?.[method];
            }

        } catch (error) {
            logger.error('Error loading event script:', error);
            throw error;
        }
    }
}