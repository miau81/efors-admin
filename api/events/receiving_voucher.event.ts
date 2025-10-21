import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiDeleteParam, ApiGetParam, ApiParam, ApiSaveParam } from "../../src/api/interfaces/api.main.interface";
import { ConvertUtil } from "../../src/api/utils/convert";
import { ApiGlobalService } from "../../src/api/services/api.global.service";
import { ApiRequestMethod, OrderBy } from "../../src/api/interfaces/api.enum";

const globalService = new ApiGlobalService();

export async function onChange(params: ApiParam, mysqlConn: ConnectionAction) {
    const convertUtil = new ConvertUtil();
    const changes = params.body.change;
    const changeKeys = Object.keys(changes);
    const existFormValue = params.body.formValue;
    const formValue: any = {};
    const parentFormValue: any = {};
    const formConfig: any = {};



    if (changeKeys.includes("partyType")) {
        const partyType = changes['partyType'];
        switch (partyType) {
            case "Customer":
            case "Supplier":
                const sqlJson = convertUtil.getSQLJsonValueString('name', params.language)
                const sql = `SELECT ${sqlJson},id FROM ${partyType} WHERE sysAcct = '${params.sys}' AND companyId='${params.com}'`;
                const parties = await mysqlConn.query(sql);
                formConfig['party'] = {
                    type: 'select',
                    options: parties.map((p: any) => { return { value: p.id, label: p.name } }),
                }
                break;
            default:
                formConfig['party'] = {
                    type: 'text',
                }
                break;
        }
        formValue['party'] = null;
    }

    const response = {
        formValue: formValue,
        formConfig: formConfig,
    }

    return response;
}


export async function afterSubmit(data: any, params: ApiParam, docType: DocumentType, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData?.docStatus != 'DRAFT') {
        return data;
    }
    await debitCompanyAcctTrnx(data, params, mysqlConn);
    switch (previousData.partyType) {
        case "Customer":
            await receiveCustomerPayment(previousData, params, mysqlConn);
            break;
        case "Supplier":
            //TODO
            break;
    }
}

export async function afterCancel(data: any, params: ApiParam, docType: DocumentType, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData?.docStatus != 'SUBMIT') {
        return data;
    }
    await creditCompanyAcctTrnx(data, params, mysqlConn);
    switch (previousData.partyType) {
        case "Customer":
            await cancelCustomerPayment(previousData, params, mysqlConn);
            break;
        case "Supplier":
            //TODO
            break;
    }
}

async function receiveCustomerPayment(payment: any, params: ApiParam, mysqlConn: ConnectionAction) {
    // Credit Customer Account Transaction
    const trnx = {
        customerId: payment.customer,
        companyId: params.com,
        transactionType: 'CREDIT',
        description: `Payment Received: ${payment.id}`,
        refDoc: "Receiving Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate
    }
    const saveCATParams: ApiSaveParam = {
        ...params,
        tableName: "customer_acct_tranx",
        body: trnx,
        method: ApiRequestMethod.CREATE
    }
    await globalService.createDocument(saveCATParams, mysqlConn);

    // Create relationship and update Sales Invoice Payment Status
    const getSIParams: ApiGetParam = {
        ...params,
        tableName: "sales_invoice",
        method: ApiRequestMethod.GET_LIST,
        selectFields: ["id", "amount"],
        customWhereQuery: `  WHERE customerId= '${payment.customerId}' AND (paymentStatus!='PAID' OR paidAmount !=grandTotal)`,
        sorting: { sortBy: OrderBy.ASC, sortField: "postingDate" },
        listOnly: true
    }
    const unpaidSI = await globalService.getDocumentList(getSIParams, mysqlConn);

    let remainingPaidAmount = payment.amount;
    for (const si of unpaidSI) {
        let paymentStatus;
        let paidAmount;
        if (si.grandTotal - si.paidAmount <= remainingPaidAmount) {
            remainingPaidAmount -= si.grandTotal;
            paidAmount = si.grandTotal;
            paymentStatus = 'PAID'
        } else {
            remainingPaidAmount = 0;
            paidAmount = si.grandTotal - remainingPaidAmount;
            paymentStatus = 'PARTIALLY_PAID'
        }
        // Update Sales Invoice Payment Status
        const updateSI = {
            paidAmount: paidAmount,
            paymentStatus: paymentStatus
        }
        const updateSIParams: ApiSaveParam = {
            ...params,
            tableName: "sales_invoice",
            body: updateSI,
            method: ApiRequestMethod.UPDATE
        }
        await globalService.updateDocument(updateSIParams, `WHERE id='${si.id}'`, mysqlConn);
        // Create relationship Ledger
        const cpr = {
            receivingVoicherId: payment.id,
            salesInvoiceId: si.id,
            paidAmount: paidAmount,
            postingDate: payment.postingDate,
        }
        const saveCPRParams: ApiSaveParam = {
            ...params,
            tableName: "customer_payment_relationship",
            body: cpr,
            method: ApiRequestMethod.CREATE
        }
        await globalService.createDocument(saveCPRParams, mysqlConn);
        if (remainingPaidAmount == 0) {
            break;
        }
    }
    if (remainingPaidAmount > 0) {
        // Create Customer Advance Payment
        const cap = {
            customerId: payment.customer,
            amount: remainingPaidAmount,
            remainingAmount: remainingPaidAmount,
            receivingVoucherId: payment.id,
            postingDate: payment.postingDate,
            status: "OPEN",
            remarks: ""
        }
        const saveCAPParams: ApiSaveParam = {
            ...params,
            tableName: "customer_advance_payment",
            body: cap,
            method: ApiRequestMethod.CREATE
        }
        await globalService.createDocument(saveCAPParams, mysqlConn);
    }
}
async function cancelCustomerPayment(payment: any, params: ApiParam, mysqlConn: ConnectionAction) {
    // Debit Customer Account Transaction
    const trnx = {
        customerId: payment.customer,
        companyId: params.com,
        transactionType: 'DEBIT',
        description: `Receiving Voucher is cancelled: ${payment.id}`,
        refDoc: "Receiving Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate
    }
    const saveCATParams: ApiSaveParam = {
        ...params,
        tableName: "customer_acct_tranx",
        body: trnx,
        method: ApiRequestMethod.CREATE
    }
    await globalService.createDocument(saveCATParams, mysqlConn);

    // delete relationship and update Sales Invoice Payment Status
    const getRelationshipParam: ApiGetParam = {
        ...params,
        tableName: "customer_payment_relationship",
        method: ApiRequestMethod.GET_LIST,
        selectFields: ["salesInvoiceId", "paidAmount"],
        customWhereQuery: `  WHERE receivingVoicherId= '${payment.id}'`,
        sorting: { sortBy: OrderBy.ASC, sortField: "id" },
        listOnly: true
    }
    const relationship = await globalService.getDocumentList(getRelationshipParam, mysqlConn);

    for (const r of relationship) {
        let paymentStatus;
        let paidAmount;
        const getSiParam: ApiGetParam = {
            ...params,
            tableName: "sales_invoice",
            method: ApiRequestMethod.GET_ONE,
        }
        const si = await globalService.getSingleDocument(getSiParam, `WHERE id='${r.salesInvoiceId}'`, mysqlConn);
        if (si.paidAmount == r.paidAmount) {
            paymentStatus = 'UNPAID';
            paidAmount = 0;
        } else {
            paymentStatus = 'PARTIALLY_PAID';
            paidAmount = si.paidAmount - r.paidAmount;
        }
        // Update Sales Invoice Payment Status
        const updateSI = {
            paidAmount: paidAmount,
            paymentStatus: paymentStatus
        }
        const updateSIParams: ApiSaveParam = {
            ...params,
            tableName: "sales_invoice",
            body: updateSI,
            method: ApiRequestMethod.UPDATE
        }
        await globalService.updateDocument(updateSIParams, `WHERE id='${si.id}'`, mysqlConn);
    }
    // Delete relationship Ledger
    const deleteCPRParams: ApiDeleteParam = {
        ...params,
        tableName: "customer_payment_relationship",
        method: ApiRequestMethod.DELETE,
        permanentDelete: true
    }
    await globalService.deleteDocument(deleteCPRParams, `WHERE receivingVoicherId='${payment.id}'`, mysqlConn);

    //Delete Customer Advance Payment if any
    const deleteCAPParams: ApiDeleteParam = {
        ...params,
        tableName: "customer_advance_payment",
        method: ApiRequestMethod.DELETE,
        permanentDelete: true
    }
    await globalService.deleteDocument(deleteCAPParams, `WHERE receivingVoicherId='${payment.id}'`, mysqlConn);
}

async function debitCompanyAcctTrnx(payment: any, params: ApiParam, mysqlConn: ConnectionAction) {
    // Debit Company Account Transaction
    const comTrnx = {
        accountId: payment.paymentMethod,
        companyId: params.com,
        transactionType: 'DEBIT',
        description: `Payment Received: ${payment.id}`,
        refDoc: "Receiving Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate
    }
    const saveComATParams: ApiSaveParam = {
        ...params,
        tableName: "company_acct_tranx",
        body: comTrnx,
        method: ApiRequestMethod.CREATE
    }
    await globalService.createDocument(saveComATParams, mysqlConn);
}

async function creditCompanyAcctTrnx(payment: any, params: ApiParam, mysqlConn: ConnectionAction) {
    // Credit Company Account Transaction
    const comTrnx = {
        accountId: payment.paymentMethod,
        companyId: params.com,
        transactionType: 'CREDIT',
        description: `Receiving Voucher is Cancelled: ${payment.id}`,
        refDoc: "Receiving Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate
    }
    const saveComATParams: ApiSaveParam = {
        ...params,
        tableName: "company_acct_tranx",
        body: comTrnx,
        method: ApiRequestMethod.CREATE
    }
    await globalService.createDocument(saveComATParams, mysqlConn);
}