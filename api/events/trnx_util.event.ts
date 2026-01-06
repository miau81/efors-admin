import {  DBOption } from "../../src/api/interfaces/api.main.interface";
import { CoreService } from "../../src/api/services/api.core.service";

const globalService = new CoreService();

export class TransactionUtilService {

    async insertAcctTranx(accountType: "COMPANY" | "CUSTOMER" | "SUPPLIER", trnx: AccountTransaction) {

        trnx.remark = trnx.remark ?? '';

        let document = "";
        switch (accountType) {
            case "COMPANY":
                document = "company_acct_tranx";
                break;
            case "CUSTOMER":
                document = "customer_acct_tranx";
                break;
            case "SUPPLIER":
                document = "supplier_acct_tranx";
                break;
        }
        await globalService.createDocument(document, trnx);
    }

    async insertPaymentRelationship(type: "CUSTOMER" | "SUPPLIER", relationship: PaymentRelationship) {
        let document = "";
        switch (type) {
            case "CUSTOMER":
                document = "customer_payment_relationship";
                break;
            case "SUPPLIER":
                document = "supplier_payment_relationship";
                break;
        }
        await globalService.createDocument(document, relationship);
    }


    async getUnpaidInvoice(invoiceType: "SALES" | "PURCHASE", partyId: string) {
        let document = "";
        let partyIdField = ""
        switch (invoiceType) {
            case "SALES":
                document = "sales_invoice";
                partyIdField = 'customerId';
                break;
            case "PURCHASE":
                document = "purchase_invoice";
                partyIdField = 'supplierId';
                break;
        }
        const options: DBOption = {
            filter: [
                { field: 'partyIdField', value: partyId },
                [{ field: 'paymentStatus', operator: "!=", value: 'PAID' }, 'or', { field: 'paidAmount', operator: "!=", value: '`grandTotal`' }],
                { field: 'docStatus', value: 'SUBMIT' }
            ],
            sort: 'postingDate ASC'
        }
        return await globalService.getDocuments(document, options);

    }

    async updateInvoicePayment(invoiceType: "SALES" | "PURCHASE", invoiceId: string, paidAmount: number, paymentStatus: InvoicePaymentStatus) {
        let document = "";
        switch (invoiceType) {
            case "SALES":
                document = "sales_invoice";
                break;
            case "PURCHASE":
                document = "purchase_invoice";
                break;
        }
        const updateSI = {
            paidAmount: paidAmount,
            paymentStatus: paymentStatus
        }
        await globalService.updateDocument(document, updateSI, [{ field: 'id', value: invoiceId }]);

    }

    async insertAdvancePayment(type: "CUSTOMER" | "SUPPLIER", advancePayment: AdvancePayment) {
        let document = "";
        switch (type) {
            case "CUSTOMER":
                document = "customer_advance_payment";
                break;
            case "SUPPLIER":
                document = "supplier_advance_payment";
                break;
        }
        await globalService.createDocument(document, advancePayment);
    }

    async getPaymentRelationShip(type: "CUSTOMER" | "SUPPLIER", voucherId: string) {
        let document = "";
        switch (type) {
            case "CUSTOMER":
                document = "customer_payment_relationship";
                break;
            case "SUPPLIER":
                document = "supplier_payment_relationship";
                break;
        }
        const options: DBOption = {
            fields: ["invoiceId", "paidAmount"],
            filter: [{ field: 'voucherId', value: voucherId }],
            sort: "id ASC"
        }
        return await globalService.getDocuments(document, options);

    }

    async getInvoiceById(invoiceType: "SALES" | "PURCHASE", invoiceId: string) {
        let document = "";
        switch (invoiceType) {
            case "SALES":
                document = "sales_invoice";
                break;
            case "PURCHASE":
                document = "purchase_invoice";
                break;
        }
        return await globalService.getDocument(document, invoiceId);
    }

    async deleteRelationshipByVoucherId(type: "CUSTOMER" | "SUPPLIER", voucherId: string) {
        let document = "";
        switch (type) {
            case "CUSTOMER":
                document = "customer_payment_relationship";
                break;
            case "SUPPLIER":
                document = "supplier_payment_relationship";
                break;
        }
        await globalService.deleteDocument(document, [{ field: 'voucherId', value: voucherId }]);
    }

    async deleteAdvancePaymentByVoucherId(type: "CUSTOMER" | "SUPPLIER", voucherId: string) {
        let document = "";
        switch (type) {
            case "CUSTOMER":
                document = "customer_advance_payment";
                break;
            case "SUPPLIER":
                document = "supplier_advance_payment";
                break;
        }
        await globalService.deleteDocument(document, [{ field: 'voucherId', value: voucherId }]);
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