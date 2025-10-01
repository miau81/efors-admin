import dayjs from "dayjs";
import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiParam } from "../../src/api/interfaces/api.main.interface";

export async function beforeGenerateReport(params: ApiParam, data: any, mysqlConn: ConnectionAction) {
    data.postingDate = dayjs(data.postingDate).format('DD-MM-YYYY');
    return data;
   


}