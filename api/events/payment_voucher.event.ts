import { ConvertUtil } from "../../src/api/utils/convert";
import { CoreService } from "../../src/api/services/api.core.service";
import { AccountTransaction, AdvancePayment, InvoicePaymentStatus, PaymentRelationship, TransactionUtilService } from "./trnx_util.event";
import { SRequest } from "../../src/api/interfaces/api.route.interface";

const globalService = new CoreService();
const tranxUtil = new TransactionUtilService();

export async function onChange(document: string, req: SRequest) {
    const convertUtil = new ConvertUtil();
    const changes = req.body.change;
    const changeKeys = Object.keys(changes);
    // const existFormValue = req.body.formValue;
    const formValue: any = {};
    // const parentFormValue: any = {};
    const formConfig: any = {};

    if (changeKeys.includes("partyType")) {
        const partyType = changes['partyType'];
        switch (partyType) {
            case "Customer":
            case "Supplier":
                const sqlJson = convertUtil.getSQLJsonValueString('name', req.language)
                const sql = `SELECT ${sqlJson},id FROM ${partyType} WHERE sysAcct = '${req.sys}' AND companyId='${req.com}'`;
                const parties = await req.mysqlConn!.query(sql);
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


export async function afterSubmit(data: any, previousData: any, req: SRequest) {
    if (previousData?.docStatus != 'DRAFT') {
        return data;
    }
    await creditCompanyAcctTrnx(data,  req);
    switch (previousData.partyType) {
        case "CUSTOMER":
            await paidToCustomer(previousData,  req);
            break;
        case "SUPPLIER":
            await paidToSupplier(previousData,  req);
            break;
    }
}

export async function afterCancel(data: any, previousData: any, req: SRequest) {
    if (previousData?.docStatus != 'SUBMIT') {
        return data;
    }
    await debitCompanyAcctTrnx(data,  req);
    switch (previousData.partyType) {
        case "Customer":
            await cancelCustomerPayment(previousData,  req);
            break;
        case "Supplier":
            await cancelSupplierPayment(previousData,  req);
            break;
    }
}

async function paidToSupplier(payment: any, req: SRequest) {
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
        postingDate: payment.postingDate,
        companyId: req.com
    }
    await tranxUtil.insertAcctTranx("SUPPLIER", trnx);

    // Create relationship and update Purchase Invoice Payment Status
    const unpaidPI = await tranxUtil.getUnpaidInvoice("PURCHASE", payment.party);

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
        await tranxUtil.updateInvoicePayment("PURCHASE", pi.id, paidAmount, paymentStatus);
        // Create relationship Ledger
        const cpr: PaymentRelationship = {
            voucherId: payment.id,
            invoiceId: pi.id,
            paidAmount: paidAmount,
            postingDate: payment.postingDate,
        }
        await tranxUtil.insertPaymentRelationship("SUPPLIER", cpr);
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
        await tranxUtil.insertAdvancePayment("SUPPLIER", sap);
    }
}

async function cancelSupplierPayment(payment: any, req: SRequest) {
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
        postingDate: payment.postingDate,
        companyId: req.com
    }
    await tranxUtil.insertAcctTranx("SUPPLIER", trnx);

    // delete relationship and update Purchase Invoice Payment Status
    const relationship = await tranxUtil.getPaymentRelationShip("SUPPLIER", payment.id);

    for (const r of relationship) {
        let paymentStatus: InvoicePaymentStatus;
        let paidAmount = 0;
        const pi = await tranxUtil.getInvoiceById("SALES", r.invoiceId);
        if (pi.paidAmount == r.paidAmount) {
            paymentStatus = 'UNPAID';
            paidAmount = 0;
        } else {
            paymentStatus = 'PARTIALLY_PAID';
            paidAmount = pi.paidAmount - r.paidAmount;
        }
        // Update Sales Invoice Payment Status
        await tranxUtil.updateInvoicePayment("PURCHASE", pi.id, paidAmount, paymentStatus);
    }
    // Delete relationship Ledger
    await tranxUtil.deleteRelationshipByVoucherId("SUPPLIER", payment.id);

    //Delete Customer Advance Payment if any
    await tranxUtil.deleteAdvancePaymentByVoucherId("SUPPLIER", payment.id);
}

async function creditCompanyAcctTrnx(payment: any, req: SRequest) {
    // Debit Company Account Transaction
    const comTrnx: AccountTransaction = {
        accountId: payment.paymentMethod,
        partyId: payment.party,
        partyType: payment.partyType,
        companyId: req.com,
        transactionType: 'CREDIT',
        description: `Paid To: ${payment.id}`,
        refDoc: "Payment Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate,
    }
    await tranxUtil.insertAcctTranx("COMPANY", comTrnx);
}

async function debitCompanyAcctTrnx(payment: any, req: SRequest) {
    // Credit Company Account Transaction
    const comTrnx: AccountTransaction = {
        accountId: payment.paymentMethod,
        partyId: payment.party,
        partyType: payment.partyType,
        companyId: req.com,
        transactionType: 'DEBIT',
        description: `Payment Voucher is Cancelled: ${payment.id}`,
        refDoc: "Payment Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate,
    }
    await tranxUtil.insertAcctTranx("COMPANY", comTrnx);
}

async function paidToCustomer(payment: any, req: SRequest) {
    // Debit Customer Account Transaction
    const document='customer_acct_tranx';
    const trnx = {
        customerId: payment.party,
        companyId: req.com,
        transactionType: 'DEBIT',
        description: `Paid To: ${payment.id}`,
        refDoc: "Payment Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate
    }
    await globalService.createDocument(document, trnx);
}

async function cancelCustomerPayment(payment: any, req: SRequest) {
    // Credit Customer Account Transaction
    const document='customer_acct_tranx';
    const trnx = {
        customerId: payment.party,
        companyId: req.com,
        transactionType: 'CREDIT',
        description: `Payment Voucher is cancelled: ${payment.id}`,
        refDoc: "Payment Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate
    }
    await globalService.createDocument(document, trnx);

}