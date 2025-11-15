import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiDeleteParam, ApiGetParam, ApiParam, ApiSaveParam } from "../../src/api/interfaces/api.main.interface";
import { ConvertUtil } from "../../src/api/utils/convert";
import { ApiGlobalService } from "../../src/api/services/api.global.service";
import { ApiRequestMethod, OrderBy } from "../../src/api/interfaces/api.enum";
import { AccountTransaction, AdvancePayment, InvoicePaymentStatus, PaymentRelationship, TransactionUtilService } from "./trnx_util.event";

const globalService = new ApiGlobalService();
const tranxUtil = new TransactionUtilService();

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
    await creditCompanyAcctTrnx(data, params, mysqlConn);
    switch (previousData.partyType) {
        case "CUSTOMER":
            await paidToCustomer(previousData, params, mysqlConn);
            break;
        case "SUPPLIER":
            await paidToSupplier(previousData, params, mysqlConn);
            break;
    }
}

export async function afterCancel(data: any, params: ApiParam, docType: DocumentType, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData?.docStatus != 'SUBMIT') {
        return data;
    }
    await debitCompanyAcctTrnx(data, params, mysqlConn);
    switch (previousData.partyType) {
        case "Customer":
            await cancelCustomerPayment(previousData, params, mysqlConn);
            break;
        case "Supplier":
            await cancelSupplierPayment(previousData, params, mysqlConn);
            break;
    }
}

async function paidToSupplier(payment: any, params: ApiParam, mysqlConn: ConnectionAction) {
    // Credit Supplier Account Transaction
    const trnx: AccountTransaction = {
        partyId: payment.party,
        accountId: payment.paymentMethod,
        transactionType: 'CREDIT',
        description: `Paid To: ${payment.id}`,
        refDoc: "Payment Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate
    }
    await tranxUtil.insertAcctTranx("SUPPLIER", trnx, params, mysqlConn);

    // Create relationship and update Purchase Invoice Payment Status
    const unpaidPI = await tranxUtil.getUnpaidInvoice("PURCHASE", payment.party, params, mysqlConn);

    let remainingPaidAmount = payment.amount;
    for (const pi of unpaidPI) {
        let paymentStatus: InvoicePaymentStatus;
        let paidAmount;
        if (pi.grandTotal - pi.paidAmount <= remainingPaidAmount) {
            remainingPaidAmount -= pi.grandTotal;
            paidAmount = pi.grandTotal;
            paymentStatus = 'PAID'
        } else {
            remainingPaidAmount = 0;
            paidAmount = pi.grandTotal - remainingPaidAmount;
            paymentStatus = 'PARTIALLY_PAID'
        }
        // Update Purchase Invoice Payment Status
        await tranxUtil.updateInvoicePayment("PURCHASE", pi.id, paidAmount, paymentStatus, params, mysqlConn);
        // Create relationship Ledger
        const cpr: PaymentRelationship = {
            voucherId: payment.id,
            invoiceId: pi.id,
            paidAmount: paidAmount,
            postingDate: payment.postingDate,
        }
        await tranxUtil.insertPaymentRelationship("SUPPLIER", cpr, params, mysqlConn);
        if (remainingPaidAmount == 0) {
            break;
        }
    }
    if (remainingPaidAmount > 0) {
        // Create Supplier Advance Payment
        const sap: AdvancePayment = {
            partyId: payment.party,
            amount: remainingPaidAmount,
            remainingAmount: remainingPaidAmount,
            voucherId: payment.id,
            postingDate: payment.postingDate,
            status: "OPEN",
            remarks: ""
        }
        await tranxUtil.insertAdvancePayment("SUPPLIER", sap, params, mysqlConn);
    }
}
async function cancelSupplierPayment(payment: any, params: ApiParam, mysqlConn: ConnectionAction) {
    // Debit Supplier Account Transaction
    const trnx: AccountTransaction = {
        partyId: payment.party,
        accountId: payment.paymentMethod,
        transactionType: 'DEBIT',
        description: `Payment Voucher is cancelled: ${payment.id}`,
        refDoc: "Payment Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate
    }
    await tranxUtil.insertAcctTranx("SUPPLIER", trnx, params, mysqlConn);

    // delete relationship and update Purchase Invoice Payment Status
    const relationship = await tranxUtil.getPaymentRelationShip("SUPPLIER", payment.id, params, mysqlConn);

    for (const r of relationship) {
        let paymentStatus: InvoicePaymentStatus;
        let paidAmount = 0;
        const pi = await tranxUtil.getInvoiceById("SALES", r.invoiceId, params, mysqlConn);
        if (pi.paidAmount == r.paidAmount) {
            paymentStatus = 'UNPAID';
            paidAmount = 0;
        } else {
            paymentStatus = 'PARTIALLY_PAID';
            paidAmount = pi.paidAmount - r.paidAmount;
        }
        // Update Sales Invoice Payment Status
        await tranxUtil.updateInvoicePayment("PURCHASE", pi.id, paidAmount, paymentStatus, params, mysqlConn);
    }
    // Delete relationship Ledger
    await tranxUtil.deleteRelationshipByVoucherId("SUPPLIER", payment.id, params, mysqlConn);

    //Delete Customer Advance Payment if any
    await tranxUtil.deleteAdvancePaymentByVoucherId("SUPPLIER", payment.id, params, mysqlConn);
}

async function creditCompanyAcctTrnx(payment: any, params: ApiParam, mysqlConn: ConnectionAction) {
    // Debit Company Account Transaction
    const comTrnx: AccountTransaction = {
        accountId: payment.paymentMethod,
        partyId: payment.party,
        partyType: payment.partyType,
        companyId: params.com,
        transactionType: 'CREDIT',
        description: `Paid To: ${payment.id}`,
        refDoc: "Payment Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate
    }
    await tranxUtil.insertAcctTranx("COMPANY", comTrnx, params, mysqlConn);
}

async function debitCompanyAcctTrnx(payment: any, params: ApiParam, mysqlConn: ConnectionAction) {
    // Credit Company Account Transaction
    const comTrnx: AccountTransaction = {
        accountId: payment.paymentMethod,
        partyId: payment.party,
        partyType: payment.partyType,
        companyId: params.com,
        transactionType: 'DEBIT',
        description: `Payment Voucher is Cancelled: ${payment.id}`,
        refDoc: "Payment Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate
    }
    await tranxUtil.insertAcctTranx("COMPANY", comTrnx, params, mysqlConn);
}

async function paidToCustomer(payment: any, params: ApiParam, mysqlConn: ConnectionAction) {
    // Debit Customer Account Transaction
    const trnx = {
        customerId: payment.party,
        companyId: params.com,
        transactionType: 'DEBIT',
        description: `Paid To: ${payment.id}`,
        refDoc: "Payment Voucher",
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
}

async function cancelCustomerPayment(payment: any, params: ApiParam, mysqlConn: ConnectionAction) {
    // Credit Customer Account Transaction
    const trnx = {
        customerId: payment.party,
        companyId: params.com,
        transactionType: 'CREDIT',
        description: `Payment Voucher is cancelled: ${payment.id}`,
        refDoc: "Payment Voucher",
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

}