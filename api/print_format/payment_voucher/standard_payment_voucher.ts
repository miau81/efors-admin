import dayjs from "dayjs";
import { ConvertUtil } from "../../../src/api/utils/convert";


export async function beforePrint(data: any) {
    const utilService= new ConvertUtil();
    data.amountInText= utilService.convertCurrencyToText(String(data.amount));
    data.postingDate= dayjs(data.postingDate).format('DD-MM-YYYY');
    return data;
    
}