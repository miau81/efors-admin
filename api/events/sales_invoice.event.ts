import dayjs from "dayjs";
import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiParam } from "../../src/api/interfaces/api.main.interface";
import { ApiGlobalService } from "../../src/api/services/api.global.service";
import { AccountTransaction, TransactionUtilService } from "./trnx_util.event";


const globalService = new ApiGlobalService();
const tranxUtil = new TransactionUtilService();

export async function onPrint(params: ApiParam, mysqlConn: ConnectionAction) {
    const body = params.body.data;
    console.log(body)
    // const data = await globalService.getSingleDocument({ ...params }, `WHERE id='${body.id}'`, mysqlConn);
    return body;
}

export async function afterSubmit(data: any, params: ApiParam, docType: DocumentType, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData?.docStatus != 'DRAFT') {
        return data;
    }
    // Debit Customer Account Transaction
    const trnx: AccountTransaction = {
        partyId: previousData.customerId,
        accountId: "",
        transactionType: 'DEBIT',
        description: `Sales Invoice: ${previousData.id}`,
        refDoc: "Sales Invoice",
        refNo: previousData.id,
        amount: previousData.grandTotal,
        postingDate: previousData.postingDate
    }
    await tranxUtil.insertAcctTranx("CUSTOMER", trnx, params, mysqlConn);
    return data;
}

export async function afterCancel(data: any, params: ApiParam, docType: DocumentType, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData?.docStatus != 'SUBMIT') {
        return data;
    }
    // Credit Customer Account Transaction
    const trnx: AccountTransaction = {
        partyId: previousData.customerId,
        accountId: '',
        transactionType: 'CREDIT',
        description: `Cancel of Sales Invoice: ${previousData.id}`,
        refDoc: "Sales Invoice",
        refNo: data.id,
        amount: previousData.grandTotal,
        postingDate: dayjs().format("YYYY-MM-DD HH:mm:ss")
    }
    await tranxUtil.insertAcctTranx("CUSTOMER", trnx, params, mysqlConn);
    if (previousData?.paymentStatus == 'UNPAID') {
        return data;
    }
    return data;
    //TODO  overpaid
}

