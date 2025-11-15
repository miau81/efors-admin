import dayjs from "dayjs";
import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiRequestMethod } from "../../src/api/interfaces/api.enum";
import { ApiParam, ApiSaveParam } from "../../src/api/interfaces/api.main.interface";
import { ApiGlobalService } from "../../src/api/services/api.global.service";
import { AccountTransaction, TransactionUtilService } from "./trnx_util.event";

const globalService = new ApiGlobalService();
const tranxUtil = new TransactionUtilService();

export async function onPrint(params: ApiParam, mysqlConn: ConnectionAction) {
    const body = params.body.data;
    const data = await globalService.getSingleDocument({ ...params }, `WHERE id='${body.id}'`, mysqlConn);
    return data;
}

export async function afterSubmit(data: any, params: ApiParam, docType: DocumentType, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData?.docStatus != 'DRAFT') {
        return data;
    }
    // Debit Supplier Account Transaction
    const trnx: AccountTransaction = {
        partyId: previousData.supplier,
        accountId: '',
        transactionType: 'DEBIT',
        description: `Purchase Invoice: ${previousData.id}`,
        refDoc: "Purchase Invoice",
        refNo: previousData.id,
        amount: previousData.grandTotal,
        postingDate: previousData.postingDate
    }
    await tranxUtil.insertAcctTranx("SUPPLIER", trnx, params, mysqlConn);
}

export async function afterCancel(data: any, params: ApiParam, docType: DocumentType, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData?.docStatus != 'SUBMIT') {
        return data;
    }
    // Credit Supplier Account Transaction
    const trnx: AccountTransaction = {
        accountId: previousData.supplier,
        partyId: '',
        transactionType: 'CREDIT',
        description: `Cancel of Purchase Invoice: ${previousData.id}`,
        refDoc: "Purchase Invoice",
        refNo: data.id,
        amount: previousData.grandTotal,
        postingDate: dayjs().format("YYYY-MM-DD HH:mm:ss")
    }
    await tranxUtil.insertAcctTranx("SUPPLIER", trnx, params, mysqlConn);
    if (previousData?.paymentStatus == 'UNPAID') {
        return;
    }
    //TODO  overpaid
}
