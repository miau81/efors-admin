import dayjs from "dayjs";
import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiRequestMethod } from "../../src/api/interfaces/api.enum";
import { ApiParam, ApiSaveParam } from "../../src/api/interfaces/api.main.interface";
import { ApiGlobalService } from "../../src/api/services/api.global.service";

const globalService = new ApiGlobalService();

export async function onPrint(params: ApiParam, mysqlConn: ConnectionAction) {
	const globalService = new ApiGlobalService();
	const body = params.body.data;
	const data = await globalService.getSingleDocument({ ...params }, `WHERE id='${body.id}'`, mysqlConn);
	return data;
}

export async function afterSubmit(data: any, params: ApiParam, docType: DocumentType, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData?.docStatus != 'DRAFT') {
        return data;
    }
    // Debit Customer Account Transaction
    const trnx = {
        customerId: previousData.customer,
        companyId: params.com,
        transactionType: 'DEBIT',
        description: `Sales Invoice: ${previousData.id}`,
        refDoc: "Sales Invoice",
        refNo: previousData.id,
        remark: "",
        amount: previousData.grandTotal,
        postingDate: previousData.postingDate
    }
    const saveParams: ApiSaveParam = {
        ...params,
        tableName: "customer_acct_tranx",
        body: trnx,
        method: ApiRequestMethod.CREATE
    }
    await globalService.createDocument(saveParams, mysqlConn);
}

export async function afterCancel(data: any, params: ApiParam, docType: DocumentType, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData?.docStatus != 'SUBMIT') {
        return data;
    }
    // Credit Customer Account Transaction
    const trnx = {
        customerId: previousData.customer,
        companyId: params.com,
        transactionType: 'CREDIT',
        description: `Cancel of Sales Invoice: ${previousData.id}`,
        refDoc: "Sales Invoice",
        refNo: data.id,
        remark: "",
        amount: previousData.grandTotal,
        postingDate: dayjs().format("YYYY-MM-DD HH:mm:ss")
    }
    const saveParams: ApiSaveParam = {
        ...params,
        tableName: "customer_acct_tranx",
        body: trnx,
        method: ApiRequestMethod.CREATE
    }
    await globalService.createDocument(saveParams, mysqlConn);
    if (previousData?.paymentStatus == 'UNPAID') {
        return;
    }
    //TODO  overpaid
}

