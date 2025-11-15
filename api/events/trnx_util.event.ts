import { dbName } from "../../src/api/databases";
import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiRequestMethod, OrderBy } from "../../src/api/interfaces/api.enum";
import { ApiDeleteParam, ApiGetParam, ApiParam, ApiSaveParam } from "../../src/api/interfaces/api.main.interface";
import { ApiGlobalService } from "../../src/api/services/api.global.service";

const globalService = new ApiGlobalService();

export class TransactionUtilService {

    async insertAcctTranx(accountType: "COMPANY" | "CUSTOMER" | "SUPPLIER", trnx: AccountTransaction, params: ApiParam, mysqlConn: ConnectionAction) {

        trnx.companyId = params.com;
        trnx.remark = trnx.remark ?? '';

        let tableName = "";
        switch (accountType) {
            case "COMPANY":
                tableName = "company_acct_tranx";
                break;
            case "CUSTOMER":
                tableName = "customer_acct_tranx";
                break;
            case "SUPPLIER":
                tableName = "supplier_acct_tranx";
                break;
        }
        const saveParams: ApiSaveParam = {
            ...params,
            tableName: tableName,
            body: trnx,
            method: ApiRequestMethod.CREATE
        }
        await globalService.createDocument(saveParams, mysqlConn);
    }

    async insertPaymentRelationship(type: "CUSTOMER" | "SUPPLIER", relationship: PaymentRelationship, params: ApiParam, mysqlConn: ConnectionAction) {
        let tableName = "";
        switch (type) {
            case "CUSTOMER":
                tableName = "customer_payment_relationship";
                break;
            case "SUPPLIER":
                tableName = "supplier_payment_relationship";
                break;
        }
        const saveCPRParams: ApiSaveParam = {
            ...params,
            tableName: tableName,
            body: relationship,
            method: ApiRequestMethod.CREATE
        }
        await globalService.createDocument(saveCPRParams, mysqlConn);
    }


    async getUnpaidInvoice(invoiceType: "SALES" | "PURCHASE", partyId: string, params: ApiParam, mysqlConn: ConnectionAction) {
        let tableName = "";
        let partyIdField=""
        switch (invoiceType) {
            case "SALES":
                tableName = "sales_invoice";
                partyIdField='customerId';
                break;
            case "PURCHASE":
                tableName = "purchase_invoice";
                 partyIdField='supplierId';
                break;
        }
        const getSIParams: ApiGetParam = {
            ...params,
            tableName: tableName,
            method: ApiRequestMethod.GET_LIST,
            customWhereQuery: `  WHERE ${partyIdField}= '${partyId}' AND (paymentStatus!='PAID' OR paidAmount !=grandTotal) AND docStatus='SUBMIT'`,
            sorting: { sortBy: OrderBy.ASC, sortField: "postingDate" },
            listOnly: true
        }
        return await globalService.getDocumentList(getSIParams, mysqlConn);

    }

    async updateInvoicePayment(invoiceType: "SALES" | "PURCHASE", invoiceId: string, paidAmount: number, paymentStatus: InvoicePaymentStatus, params: ApiParam, mysqlConn: ConnectionAction) {
        let tableName = "";
        switch (invoiceType) {
            case "SALES":
                tableName = "sales_invoice";
                break;
            case "PURCHASE":
                tableName = "purchase_invoice";
                break;
        }
        const updateSI = {
            paidAmount: paidAmount,
            paymentStatus: paymentStatus
        }
        console.log("updateSI:",updateSI)
        const updateSIParams: ApiSaveParam = {
            ...params,
            tableName: tableName,
            body: updateSI,
            method: ApiRequestMethod.UPDATE
        }
        await globalService.updateDocument(updateSIParams, `WHERE id='${invoiceId}'`, mysqlConn);

    }

    async insertAdvancePayment(type: "CUSTOMER" | "SUPPLIER", advancePayment: AdvancePayment, params: ApiParam, mysqlConn: ConnectionAction) {
        let tableName = "";
        switch (type) {
            case "CUSTOMER":
                tableName = "customer_advance_payment";
                break;
            case "SUPPLIER":
                tableName = "supplier_advance_payment";
                break;
        }
        const saveCAPParams: ApiSaveParam = {
            ...params,
            tableName: tableName,
            body: advancePayment,
            method: ApiRequestMethod.CREATE
        }
        await globalService.createDocument(saveCAPParams, mysqlConn);
    }

    async getPaymentRelationShip(type: "CUSTOMER" | "SUPPLIER", voucherId: string, params: ApiParam, mysqlConn: ConnectionAction) {
        let tableName = "";
        switch (type) {
            case "CUSTOMER":
                tableName = "customer_payment_relationship";
                break;
            case "SUPPLIER":
                tableName = "supplier_payment_relationship";
                break;
        }
        const getRelationshipParam: ApiGetParam = {
            ...params,
            tableName: tableName,
            method: ApiRequestMethod.GET_LIST,
            selectFields: ["invoiceId", "paidAmount"],
            customWhereQuery: `  WHERE voucherId= '${voucherId}'`,
            sorting: { sortBy: OrderBy.ASC, sortField: "id" },
            listOnly: true
        }
        return await globalService.getDocumentList(getRelationshipParam, mysqlConn);

    }

    async getInvoiceById(invoiceType: "SALES" | "PURCHASE", invoiceId: number, params: ApiParam, mysqlConn: ConnectionAction) {
        let tableName = "";
        switch (invoiceType) {
            case "SALES":
                tableName = "sales_invoice";
                break;
            case "PURCHASE":
                tableName = "purchase_invoice";
                break;
        }
        const getSiParam: ApiGetParam = {
            ...params,
            tableName: tableName,
            method: ApiRequestMethod.GET_ONE,
        }
        return await globalService.getSingleDocument(getSiParam, `WHERE id='${invoiceId}'`, mysqlConn);
    }

    async deleteRelationshipByVoucherId(type: "CUSTOMER" | "SUPPLIER", voucherId: string, params: ApiParam, mysqlConn: ConnectionAction) {
        let tableName = "";
        switch (type) {
            case "CUSTOMER":
                tableName = "customer_payment_relationship";
                break;
            case "SUPPLIER":
                tableName = "supplier_payment_relationship";
                break;
        }
        const deleteCPRParams: ApiDeleteParam = {
            ...params,
            tableName: tableName,
            method: ApiRequestMethod.DELETE,
            permanentDelete: true
        }
        await globalService.deleteDocument(deleteCPRParams, `WHERE voucherId='${voucherId}'`, mysqlConn);
    }

        async deleteAdvancePaymentByVoucherId(type: "CUSTOMER" | "SUPPLIER", voucherId: string, params: ApiParam, mysqlConn: ConnectionAction) {
        let tableName = "";
        switch (type) {
            case "CUSTOMER":
                tableName = "customer_advance_payment";
                break;
            case "SUPPLIER":
                tableName = "supplier_advance_payment";
                break;
        }
        const deleteCPRParams: ApiDeleteParam = {
            ...params,
            tableName: tableName,
            method: ApiRequestMethod.DELETE,
            permanentDelete: true
        }
        await globalService.deleteDocument(deleteCPRParams, `WHERE voucherId='${voucherId}'`, mysqlConn);
    }



}

export type InvoicePaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface AccountTransaction {
    accountId: string;
    partyId: string;
    partyType?: "CUSTOMER" | "SUPPLIER" | "OTHER"
    companyId?: string;
    transactionType: 'DEBIT' | 'CREDIT';
    description: string;
    refDoc: string;
    refNo: string;
    remark?: string;
    amount: number;
    postingDate: string;
}

export interface PaymentRelationship {
    voucherId: string;
    invoiceId: string;
    paidAmount: number;
    postingDate: string;
}

export interface AdvancePayment {
    partyId: string;
    voucherId: string;
    amount: number;
    remainingAmount: number;
    postingDate: string;
    status: "OPEN" | "CLOSED",
    remarks?: string;
}