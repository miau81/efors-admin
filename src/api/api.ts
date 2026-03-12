import { Route } from "./interfaces/api.route.interface";
import { ApiConfigRoute } from "./routers/api.config.route";
import { ApiDocumentRoute } from "./routers/api.document.route";
import { ApiAuthGuardRoute } from "./routers/api.auth-guard.route";
import express from "express";
import { ApiUserRoute } from "./routers/api.user.route";
import { ApiFileRoute } from "./routers/api.file.router";
import { ApiReportRoute } from "./routers/api.report.route";
import { logger } from "./utils/logger";

import figlet from "figlet";
class API {
    constructor(public app: express.Application) {
        this.init();
    }

    private async init() {
        const file = await Bun.file('package.json').json();
        // const appName = `${await figlet.text("Efors!")} v${version}\n`;
        const appName = `${'Efors'} v${file.version}\n`;
        logger.notimeLog(appName);
        this.initializeMiddlewares();
        this.initRouter();
        this.errorHander();
    }

    private initRouter() {
        const routes: Route[] = [
            new ApiAuthGuardRoute(),
            new ApiUserRoute(),
            new ApiConfigRoute(),
            new ApiDocumentRoute(),
            new ApiFileRoute(),
            new ApiReportRoute()
        ];
        //   logger.info(`Initializing routes...`);
        routes.forEach(route => {
            this.app.use('/api/', route.router);
        });

        //  logger.info(`Route is initialized.`);
    }

    private initializeMiddlewares() {


        logger.info(`Initializing Middlewares...`);
        // const logConfig = appConfigs.log
        // this.app.use(morgan(logConfig['format'], { stream }));
        // const corsConfig = appConfigs.cors
        // this.app.use(cors({ origin: corsConfig['origin'], credentials: corsConfig['credentials'] }));
        // this.app.use(cors({ origin: "*", credentials: true }));
        // this.app.use(hpp());
        // this.app.use(helmet());
        // this.app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
        // this.app.use(compression());
        this.app.use(express.json({ limit: "100mb" }));
        this.app.use(express.urlencoded({ limit: "100mb", extended: false }));
        // this.app.use(cookieParser());
        this.app.use("/client-script", express.static("client-script"));
    }

    private errorHander() {
        // Error
        this.app.use((error: any, _req: any, res: any, _next: any) => {
            res.status(error.status || 500).json({ ...error, message: error.message });
        });
    }
}

export default API