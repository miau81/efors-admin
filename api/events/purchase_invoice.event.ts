import dayjs from "dayjs";
import { AccountTransaction, TransactionUtilService } from "./trnx_util.event";
import { SRequest } from "../../src/api/interfaces/api.route.interface";


const tranxUtil = new TransactionUtilService();

export async function onPrint(data:string, req:SRequest) {
    const body = req.body.data;
    // const data = await globalService.getSingleDocument({ ...params }, `WHERE id='${body.id}'`, mysqlConn);
    return data;
}

export async function afterSubmit(data: any, previousData: any,req:SRequest) {
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
        postingDate: previousData.postingDate,
        companyId : req.com
    }
    await tranxUtil.insertAcctTranx("SUPPLIER", trnx);
}

export async function afterCancel(data: any,previousData: any,req:SRequest) {
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
        postingDate: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        companyId : req.com
    }
    await tranxUtil.insertAcctTranx("SUPPLIER", trnx);
    if (previousData?.paymentStatus == 'UNPAID') {
        return;
    }
    //TODO  overpaid
}
