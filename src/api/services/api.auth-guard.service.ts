
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { SRequest } from "../interfaces/api.route.interface";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { JWTService } from "./jwt.service";
import { ConnectionPool, dbName } from "../databases";


const db = dbName;
export class ApiAuthGuardService {

    private jwtService = new JWTService();


    async authorizeCheck(req: SRequest) {
        const mysqlConn: ConnectionAction = await ConnectionPool();
        try {
            //Check API Token
            const apiToken = req.headers['api-token'] || '';
            if (!apiToken) {
                throw new UnauthorizedException("API token is required.", "REQUIRED_API_TOKEN");
            }

            const apps = await mysqlConn.querySingle(`SELECT * FROM api_token WHERE token='${apiToken}'`);
            if (!apps) {
                throw new UnauthorizedException("Invalid API Token.", "INVALID_API_TOKEN");
            }
            req.fromApp = apps.id;
            req.language = (req.query["_language"] || 'en') as string;
            req.mysqlConn = mysqlConn
            // Check URL Permission
            const baseUrl: string = req.url.split("?").shift() || ""
            if (await this.isAllowedURL(req.method, baseUrl, mysqlConn)) {
                // req.sys = req.query["sys"] as string;
                // req.com = req.query["com"] as string;
                // const com = await mysqlConn.querySingle(`SELECT * FROM company WHERE id='${req.com}' AND sysAcct='${req.sys}'`);
                // if(!com){
                //     throw new UnauthorizedException("Invalid sys or com.");
                // }
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

            req.user = user;
            req.sys = user.isSystemAdmin ? req.query["sys"] || user.sysAcct : user.sysAcct;
            req.com = user.isSystemAdmin ? req.query["com"] || user.defaultCompany : user.defaultCompany;
            
            return;
        } catch(error) {
            mysqlConn?.release();
            throw error;
        }
    }

    private async isAllowedURL(method: string, url: string, mysqlConn: ConnectionAction): Promise<boolean> {
        switch (method) {
            case "POST":
                switch (url) {
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
        const user = await mysqlConn.querySingle(`SELECT * from user WHERE id= '${decoded.id}'`);
        return user;
    }
}

