import { ConnectionAction } from "../interfaces/api.db.interface";
import { ApiParam } from "../interfaces/api.main.interface";
import { ApiGlobalService } from "./api.global.service";

// import { spawn } from "bun";
const currentFileUrl = import.meta.url;



export class ApiReportService {
    readonly globalService = new ApiGlobalService();
    readonly reportPath = `${import.meta.dir}/../../../api/report`;




    private workerId: number = 0;
    private pendingRequests = new Map();
    private worker?: Worker

    initWorker() {
        const printFilePath = `${import.meta.dir}/../../../api/workers/jsreport.worker.ts`;
        this.worker = new Worker(printFilePath, { type: "module" });
        this.worker.onmessage = (event: MessageEvent) => {
            const { id, result, error } = event.data;
            const request = this.pendingRequests.get(id);
            if (request) {
                if (error) {
                    request.reject(new Error(error));
                } else {
                    request.resolve(result);
                }
                this.pendingRequests.delete(id);
            }
        };

    }





    async generateReport(params: ApiParam, data: any, mysqlConn: ConnectionAction) {
        const scriptFile = data.reportFile;
        data = await data;
        try {
            const path = new URL(`${this.reportPath}/${scriptFile}.ts`, import.meta.url).href;
            const imp = await import(/* @vite-ignore */ path);
            if (imp.beforePrint) {
                data = await imp.beforeGenerateReport(params, data, mysqlConn);
            }
            return await this.generateReportFile(data.html, data.type, data.fieName, data.data, data.renderEngine);
        } catch (error) {
            console.error(error);
        }
    }


    public async generateReportFile(
        html: string,
        type: "pdf" | "xlsx",
        fileName: string,
        data?: any,
        renderEngine: "none" | "ejs" | "jsrender" = "none"
    ): Promise<any> {

        // console.log(this.worker)
        if (!this.worker) {
            this.initWorker()
        }




        const workerInput = {
            html,
            type,
            fileName,
            data,
            renderEngine
        };



        const buffer = await new Promise((resolve, reject) => {
            const id = ++this.workerId;
            this.pendingRequests.set(id, { resolve, reject });
            this.worker?.postMessage({ id, data: workerInput });
        });
        let contentType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        switch (type) {
            case "pdf":
                contentType = 'application/pdf';
                break;
            case "xlsx":
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
        }

        // await process.exited;

        //  const result = JSON.parse(output);
        // Decode the buffer back
        // const decodedBuffer = Buffer.from(result.buffer, 'base64');

        return {
            contentType: contentType,
            fileName: fileName,
            buffer: buffer
        };






        // return {
        //     contentType: contentType,
        //     fileName: fileName,
        //     buffer: result
        // };


        // const instance = await this.getJsReportInstance();
        // let recipe: 'chrome-pdf' | 'html-to-xlsx';
        // let contentType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        // switch (type) {
        //     case "pdf":
        //         recipe = 'chrome-pdf';
        //         contentType = 'application/pdf';
        //         break;
        //     case "xlsx":
        //         recipe = 'html-to-xlsx';
        //         contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        //         break;
        // }
        // const result = await instance.render({
        //     template: {
        //         content: html,
        //         engine: renderEngine,
        //         recipe: recipe,
        //     },
        //     data
        // });

        // return {
        //     contentType: contentType,
        //     fileName: fieName || `report.${type}`,
        //     buffer: result.content
        // };
    }


    // public async generateReportFile(
    //     html: string,
    //     type: "pdf" | "xlsx",
    //     fileName: string,
    //     data?: any,
    //     renderEngine: "none" | "ejs" | "jsrender" = "none"
    // ): Promise<any> {
    //     const printFilePath = `${import.meta.dir}/../../../api/workers`;
    //     const workerInput = JSON.stringify({
    //         html,
    //         type,
    //         fileName,
    //         data,
    //         renderEngine
    //     });

    //     const process = Bun.spawn([
    //         "bun", // or "bun run" if you have a build step
    //         `${printFilePath}/jsreport.worker.ts`, // path to the worker file
    //     ], {
    //         stdin: new TextEncoder().encode(workerInput),
    //         stdout: 'pipe',
    //         stderr: 'inherit'
    //     });
    //     // const stdoutPromise = Bun.readableStreamToText(process.stdout);
    //     // const stderrPromise = Bun.readableStreamToText(process.stderr);

    //     // const [errorOutput] = await Promise.all([stderrPromise]);


    //     await process.exited;

    //     const result: any = await Bun.readableStreamToArrayBuffer(process.stdout);
    //     // console.log(result)


    //     if (process.exitCode !== 0) {
    //         // throw new Error(`Worker process failed with code ${process.exitCode}:\n${errorOutput}`);
    //     }

    //     let contentType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' = "application/pdf";
    //     switch (type) {
    //         case "pdf":
    //             contentType = 'application/pdf';
    //             break;
    //         case "xlsx":
    //             contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    //             break;
    //     }

    //     // await process.exited;

    //     //  const result = JSON.parse(output);
    //     // Decode the buffer back
    //     // const decodedBuffer = Buffer.from(result.buffer, 'base64');

    //     return {
    //         contentType: contentType,
    //         fileName: fileName,
    //         buffer: result
    //     };


    //     // const instance = await this.getJsReportInstance();
    //     // let recipe: 'chrome-pdf' | 'html-to-xlsx';
    //     // let contentType: 'application/pdf' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    //     // switch (type) {
    //     //     case "pdf":
    //     //         recipe = 'chrome-pdf';
    //     //         contentType = 'application/pdf';
    //     //         break;
    //     //     case "xlsx":
    //     //         recipe = 'html-to-xlsx';
    //     //         contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    //     //         break;
    //     // }
    //     // const result = await instance.render({
    //     //     template: {
    //     //         content: html,
    //     //         engine: renderEngine,
    //     //         recipe: recipe,
    //     //     },
    //     //     data
    //     // });

    //     // return {
    //     //     contentType: contentType,
    //     //     fileName: fieName || `report.${type}`,
    //     //     buffer: result.content
    //     // };
    // }
}