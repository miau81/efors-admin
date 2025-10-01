declare var self: any;
let jsreportInstance: any | null = null;
let jsreportInitPromise: Promise<any> | null = null;

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory of the current file to anchor the CommonJS require
const currentFileUrl = import.meta.url;
const require = createRequire(currentFileUrl);

async function getJsReportInstance() {
    if (!jsreportInitPromise) {
        jsreportInitPromise = (async () => {
            const jsreportModule = require('jsreport-core');
            jsreportInstance = jsreportModule();

            // const jsrender = require('jsreport-jsrender');
            // const chromePdf = require('jsreport-chrome-pdf');
            // const htmlToXlsx = require('jsreport-html-to-xlsx');

            // You need to CALL the extensions (e.g., `jsrender()`)
            // before passing them to the use() method.
            // jsreportInstance.use(jsrender());
            // jsreportInstance.use(chromePdf());
            // jsreportInstance.use(htmlToXlsx());

            await jsreportInstance.init();

            return jsreportInstance;
        })();
    }
    return jsreportInitPromise;
}

async function generateReportFile(req: any): Promise<any> {
    try {

        const { html, type,  data, renderEngine } = req;
        const instance = await getJsReportInstance();

        let recipe: 'chrome-pdf' | 'html-to-xlsx' = 'chrome-pdf';
        let contentType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' = "application/pdf";
        switch (type) {
            case "pdf":
                recipe = 'chrome-pdf';
                contentType = 'application/pdf';
                break;
            case "xlsx":
                recipe = 'html-to-xlsx';
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
        }
        const result = await instance.render({
            template: {
                content: html,
                engine: renderEngine,
                recipe: recipe,
            },
            data
        });

        return result.content;
    } catch (error) {
        console.error("JS ERROR:", error)
    }

}


self.onmessage = async (event: MessageEvent) => {
    const { id, data } = event.data;
    const res = await generateReportFile(data);
    self?.postMessage({id,result:res})
}