import dayjs from "dayjs";
import { ConnectionAction } from "../../../src/api/interfaces/api.db.interface";
import { ApiParam } from "../../../src/api/interfaces/api.main.interface";
import { ConvertUtil } from "../../../src/api/utils/convert";


export async function beforePrint(params: ApiParam, data: any, mysqlConn: ConnectionAction) {
    const utilService= new ConvertUtil();
    data.totalReceiveInText= utilService.convertCurrencyToText(String(data.totalReceive));
    data.postingDate= dayjs(data.postingDate).format('DD-MM-YYYY');
    return data;
    
}