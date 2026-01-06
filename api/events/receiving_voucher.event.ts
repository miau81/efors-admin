import { SRequest } from "../../src/api/interfaces/api.route.interface";
import { ConvertUtil } from "../../src/api/utils/convert";
import { AccountTransaction, AdvancePayment, InvoicePaymentStatus, PaymentRelationship, TransactionUtilService } from "./trnx_util.event";


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
            case "CUSTOMER":
            case "SUPPLIER":
                const sqlJson = convertUtil.getSQLJsonValueString('name', req.language)
                const sql = `SELECT ${sqlJson},id FROM ${partyType} WHERE sysAcct = '${req.sys}' AND companyId='${req.com}'`;
                const parties = await req.mysqlConn!.query(sql);
                formConfig['partyId'] = {
                    type: 'select',
                    options: parties.map((p: any) => { return { value: p.id, label: p.name } }),
                }
                break;
            default:
                formConfig['partyId'] = {
                    type: 'text',
                }
                break;
        }
        formValue['partyId'] = null;
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
    await debitCompanyAcctTrnx(data, req);

    switch (previousData.partyType) {
        case "CUSTOMER":
            await receiveCustomerPayment(previousData, req);
            break;
        case "SUPPLIER":
            await receiveSupplierPayment(previousData, req);
            break;
    }
    return data;
}

export async function afterCancel(data: any, previousData: any, req: SRequest) {
    if (previousData?.docStatus != 'SUBMIT') {
        return data;
    }
    await creditCompanyAcctTrnx(data, req);
    switch (previousData.partyType) {
        case "Customer":
            await cancelCustomerPayment(previousData, req);
            break;
        case "Supplier":
            await cancelSupplierPayment(previousData, req);
            break;
    }
}

async function receiveCustomerPayment(payment: any, req: SRequest) {
    // Credit Customer Account Transaction
    const trnx: AccountTransaction = {
        partyId: payment.partyId,
        accountId: payment.paymentMethod,
        transactionType: 'CREDIT',
        description: `Payment Received: ${payment.id}`,
        refDoc: "Receiving Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate,
        companyId: req.com
    }
    await tranxUtil.insertAcctTranx("CUSTOMER", trnx);

    // Create relationship and update Sales Invoice Payment Status

    const unpaidSI = await tranxUtil.getUnpaidInvoice("SALES", payment.partyId);

    let remainingPaidAmount = payment.amount;
    for (const si of unpaidSI) {
        let paymentStatus: InvoicePaymentStatus;
        let paidAmount: number = 0;
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

        await tranxUtil.updateInvoicePayment("SALES", si.id, paidAmount, paymentStatus);

        // Create relationship Ledger
        const cpr: PaymentRelationship = {
            voucherId: payment.id,
            invoiceId: si.id,
            paidAmount: paidAmount,
            postingDate: payment.postingDate,
        }

        await tranxUtil.insertPaymentRelationship("CUSTOMER", cpr);

        if (remainingPaidAmount == 0) {
            break;
        }
    }
    if (remainingPaidAmount > 0) {
        // Create Customer Advance Payment
        const cap: AdvancePayment = {
            partyId: payment.partyId,
            amount: remainingPaidAmount,
            remainingAmount: remainingPaidAmount,
            voucherId: payment.id,
            postingDate: payment.postingDate,
            status: "OPEN",
            remarks: ""
        }
        await tranxUtil.insertAdvancePayment("CUSTOMER", cap);
    }
}
async function cancelCustomerPayment(payment: any, req: SRequest) {
    // Debit Customer Account Transaction
    const trnx: AccountTransaction = {
        partyId: payment.partyId,
        accountId: payment.paymentMethod,
        transactionType: 'DEBIT',
        description: `Receiving Voucher is cancelled: ${payment.id}`,
        refDoc: "Receiving Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate,
        companyId: req.com
    }
    await tranxUtil.insertAcctTranx("CUSTOMER", trnx);

    // delete relationship and update Sales Invoice Payment Status

    const relationship = await tranxUtil.getPaymentRelationShip("CUSTOMER", payment.id);

    for (const r of relationship) {
        let paymentStatus: InvoicePaymentStatus;
        let paidAmount = 0;

        const si = await tranxUtil.getInvoiceById("SALES", r.invoiceId);
        if (si.paidAmount == r.paidAmount) {
            paymentStatus = 'UNPAID';
            paidAmount = 0;
        } else {
            paymentStatus = 'PARTIALLY_PAID';
            paidAmount = si.paidAmount - r.paidAmount;
        }
        // Update Sales Invoice Payment Status
        await tranxUtil.updateInvoicePayment("SALES", si.id, paidAmount, paymentStatus);
    }
    // Delete relationship Ledger
    await tranxUtil.deleteRelationshipByVoucherId("CUSTOMER", payment.id);

    //Delete Customer Advance Payment if any
    await tranxUtil.deleteAdvancePaymentByVoucherId("CUSTOMER", payment.id);
}

async function debitCompanyAcctTrnx(payment: any, req: SRequest) {
    // Debit Company Account Transaction
    const comTrnx: AccountTransaction = {
        accountId: payment.paymentMethod,
        partyId: payment.partyId,
        partyType: payment.partyType,
        transactionType: 'DEBIT',
        description: `Payment Received: ${payment.id}`,
        refDoc: "Receiving Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate,
        companyId: req.com
    }
    await tranxUtil.insertAcctTranx("COMPANY", comTrnx);
}

async function creditCompanyAcctTrnx(payment: any, req: SRequest) {
    // Credit Company Account Transaction
    const comTrnx: AccountTransaction = {
        accountId: payment.paymentMethod,
        partyId: payment.partyId,
        partyType: payment.partyType,
        transactionType: 'CREDIT',
        description: `Receiving Voucher is Cancelled: ${payment.id}`,
        refDoc: "Receiving Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate,
        companyId: req.com
    }
    await tranxUtil.insertAcctTranx("COMPANY", comTrnx);
}

async function receiveSupplierPayment(payment: any, req: SRequest) {
    // Credit Supplier Account Transaction
    const trnx: AccountTransaction = {
        partyId: payment.partyId,
        accountId: payment.paymentMethod,
        transactionType: 'DEBIT',
        description: `Payment Received: ${payment.id}`,
        refDoc: "Receiving Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate,
        companyId: req.com
    }
    await tranxUtil.insertAcctTranx("SUPPLIER", trnx);
}

async function cancelSupplierPayment(payment: any, req: SRequest) {
    // Credit Supplier Account Transaction
    const trnx: AccountTransaction = {
        partyId: payment.partyId,
        accountId: payment.paymentMethod,
        transactionType: 'CREDIT',
        description: `Receiving Voucher is cancelled: ${payment.id}`,
        refDoc: "Receiving Voucher",
        refNo: payment.id,
        remark: payment.remark,
        amount: payment.amount,
        postingDate: payment.postingDate,
        companyId: req.com
    }
    await tranxUtil.insertAcctTranx("SUPPLIER", trnx);


}