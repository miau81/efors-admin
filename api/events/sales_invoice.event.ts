import { AccountTransaction, TransactionUtilService } from "./trnx_util.event";
import { SRequest } from "../../src/api/interfaces/api.route.interface";
import dayjs from "dayjs";
import { core } from "../../src/api/core/core";

const tranxUtil = new TransactionUtilService();

export async function onChange(document: string, req: SRequest) {

    // c
}

export async function onPrint(data: string, req: SRequest) {
    const body = req.body.data;
    // const data = await globalService.getSingleDocument({ ...params }, `WHERE id='${body.id}'`, mysqlConn);
    return body;
}

export async function afterSubmit(data: any, previousData: any, req: SRequest) {
    if (previousData.docStatus != 'DRAFT') {
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
        postingDate: previousData.postingDate,
        companyId: req.com
    }
    await tranxUtil.insertAcctTranx("CUSTOMER", trnx);
    return data;
}

export async function afterCancel(data: any, previousData: any, req: SRequest) {
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
    await tranxUtil.insertAcctTranx("CUSTOMER", trnx);
    if (previousData?.paymentStatus == 'UNPAID') {
        return data;
    }
    return data;
    //TODO  overpaid
}


async function calculateItemTax(tax: any, valueToCalculate: number) {
    if (!tax) {
        return 0;
    }
    switch (tax.chargeBy) {
        case "PERCENTAGE":
            return Math.round((tax.rate / 100 * valueToCalculate) * 100) / 100;
        case "AMOUNT":
            return tax.rate;
    }
}