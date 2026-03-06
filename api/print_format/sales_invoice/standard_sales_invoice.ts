import dayjs from "dayjs";
import { ConvertUtil } from "../../../src/api/utils/convert";
import { SRequest } from "../../../src/api/interfaces/api.route.interface";
import { core } from "../../../src/api/core/core";


export async function beforePrint(req: SRequest, data: any) {
    const utilService = new ConvertUtil();
    data.grandTotalInText = utilService.convertCurrencyToText(String(data.grandTotal));
    data.postingDate = dayjs(data.postingDate).format('DD-MM-YYYY');
    data.customer = core.getDocument(req, "Customer", data.customerId);
    return data;

}