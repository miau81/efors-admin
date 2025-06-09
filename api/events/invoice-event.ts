import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiParam } from "../../src/api/interfaces/api.main.interface";
import { ApiGlobalService } from "../../src/api/services/api.global.service";



export async function onPrint(params: ApiParam, mysqlConn: ConnectionAction) {
        const globalService = new ApiGlobalService();
        const body = params.body.data;
        const data = await globalService.getSingleDocument({ ...params }, `WHERE id='${body.id}'`, mysqlConn);
        console.log(data)
        return data;
}