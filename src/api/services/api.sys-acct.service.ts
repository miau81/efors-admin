import dayjs from "dayjs";
import { dbName } from "../databases";
import { BadRequestException } from "../exceptions/BadRequestException";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { CoreService } from "./api.core.service";

const db = dbName;
export class ApiSysAcctService {
    private globalService = new CoreService();

    async findAll(mysqlConn: ConnectionAction): Promise<any[]> {
        return await mysqlConn.query(`SELECT * FROM ${db}.sys_acct`);
    }

    async findById(id: string, mysqlConn: ConnectionAction): Promise<any> {
        return await mysqlConn.querySingle(`SELECT * FROM ${db}.sys_acct WHERE id='${id}'`);
    }

async create(body: any, mysqlConn: ConnectionAction): Promise<any> {
        if (!body.name) {
            throw new BadRequestException("[name] is required!", "REQUIRED_FIELD");
        }

        const data = {
            ...body,
            createdOn: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            modifiedOn: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        };

        return await this.globalService.create({ requestBody: data }, mysqlConn);
    }

async update(id: string, body: any, mysqlConn: ConnectionAction): Promise<any> {
        const data = {
            ...body,
            modifiedOn: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        };

        return await this.globalService.update({ requestBody: data, id }, mysqlConn);
    }

    async delete(id: string, mysqlConn: ConnectionAction): Promise<void> {
        await mysqlConn.query(`DELETE FROM ${db}.sys_acct WHERE id='${id}'`);
    }
}