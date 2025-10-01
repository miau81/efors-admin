
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { AuthURL } from "../interfaces/api.enum";
import { SRequest } from "../interfaces/api.route.interface";
import { ConnectionAction } from "../interfaces/api.db.interface";

import { JWTService } from "./jwt.service";
import { GetDataOption } from "../interfaces/api.entity.interface";
import { ApiGlobalService } from "./api.global.service";
import { ConnectionPool, dbName } from "../databases";


const db = dbName;
export class ApiPermissionService {

    private globalService = new ApiGlobalService();
    private jwtService = new JWTService();


    async authorizeCheck(req: SRequest) {
        const mysqlConn: ConnectionAction = await ConnectionPool();
        try {
            //Check API Token
            const apiToken = req.headers['api-token'] || '';
            if (!apiToken) {
                throw new UnauthorizedException("API token is required.", "REQUIRED_API_TOKEN");
            }
            const exists: any = await this.globalService.checkExists('api_token', `WHERE token='${apiToken}'`, mysqlConn);
            if (!exists.exists) {
                throw new UnauthorizedException("Invalid API Token.", "INVALID_API_TOKEN");
            }

            // Check URL Permission
            const baseUrl: string = req.url.split("?").shift() || ""

            if (await this.isAllowedURL(req.method, baseUrl, mysqlConn)) {
                return;
            }

            //Check Auth Token

            if (baseUrl.startsWith("/admin")) {
                req.authURL = AuthURL.ADMIN;
            } else if (baseUrl.startsWith("/auth")) {
                req.authURL = AuthURL.AUTH;
            } else {
                req.authURL = AuthURL.PUBLIC;
                return;
            }


            let token = req.headers['authorization'] || "";
            if (!token) {
                throw new UnauthorizedException("Authorization token is required.", "REQUIRED_AUTH_TOKEN");
            }
            token = token.split("Bearer ")[1];

            const user = await this.getUser(token, mysqlConn);
            if (!user) {
                throw new UnauthorizedException("Invalid authorization token.", "INVALID TOKEN");
            }
            req.sys = user.isSystemAdmin ? req.query["sys"] || user.sysAcct : user.sysAcct;
            req.com = user.isSystemAdmin ? req.query["com"] || user.defaultCompany : user.defaultCompany;
            req.language = (req.query["language"] || 'en') as string;
            req.authUser = user;
            return;
        } finally {
            mysqlConn?.release();
        }
    }

    private async isAllowedURL(method: string, url: string, mysqlConn: ConnectionAction): Promise<boolean> {
        switch (method) {
            case "POST":
                switch (url) {
                    case "/admin/login":
                    case "/auth/login":
                    case "/auth/login/firebase":
                    case "/auth/password/reset":
                    case "/auth/password/forgot":
                    case "/auth/register":
                        return true
                }
                break;
        }
        const exists = await mysqlConn.querySingle(`SELECT id FROM ${db}.url_permit WHERE '${url}' LIKE REPLACE(url,'*','%') AND method='${method}'`);
        if (exists) {
            return true;
        }
        return false;

    }

    private async getUser(token: string, mysqlConn: ConnectionAction): Promise<any> {
        const decoded: any = this.jwtService.verifyToken(token);
        const docType = await this.globalService.getDocumentType("user");
        const options: GetDataOption = {
            tableName: "user",
            docType: docType,
            mysqlConn: mysqlConn,
            getChild: true,
            getParent: true,
            sqlWhere: `WHERE id= '${decoded.id}'`
        }
        const user = await this.globalService.getData(options);
        return user ? user[0] : null;
    }
}

