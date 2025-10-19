import { dbName } from "../../src/api/databases";
import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { GetDataOption } from "../../src/api/interfaces/api.entity.interface";
import { ApiRequestMethod, OrderBy } from "../../src/api/interfaces/api.enum";
import { ApiGetParam, ApiParam, ApiSaveParam } from "../../src/api/interfaces/api.main.interface";
import { ApiGlobalService } from "../../src/api/services/api.global.service";
import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";


const globalService = new ApiGlobalService();
const db = dbName;

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "receiving_voucher",
        label: '{"en":"Receiving Voucher"}',
        namingType: "sequence",
        namingFormat: "RV-{YYYY}-{0000}",
        searchFields: ["code", "name"],
        canSubmit: true,
        printScript: "SERVER",
        defaultSorting: 'createdDate',
        defaultSortBy: "DESC",
        printFormats: [
            { code: "STD_RECEIVING_VOUCHER", fileName: "standard_receiving_voucher", label: '{"en":"Standard Receiving Voucher"}', isDefault: true },
        ],
        sections: [
            { id: 'sectionDetails', label: '', sorting: 1 }
        ],
        fields: [
            { id: "id", type: "text", label: '{"en":"Receipt No"}', showInTable: true, showInForm: true, isReadOnly: true, isPrimaryKey: true, showInFilter: true, sectionId: 'sectionDetails' },
            { id: 'break_1', type: 'breakline', showInForm: true, sectionId: 'sectionDetails' },
            {
                id: "docStatus", type: "text", formComponentType: "select", sectionId: 'sectionDetails',
                showInTable: true, defaultValue: 'DRAFT', label: '{"en":"Status"}', showInFilter: true,
                options: [
                    { value: "DRAFT", label: '{"en":"Draft"}' },
                    { value: "SUBMIT", label: '{"en":"Submit"}' },
                    { value: "CANCELLED", label: '{"en":"Cancelled"}' }
                ],
            },
            {
                id: 'partyType', type: 'dropdown', formComponentType: "select", mandatory: true,
                showInTable: true, showInForm: true, sectionId: 'sectionDetails', callServerScript: true,
                options: [
                    { value: "Customer", label: '{"en":"Customer"}' },
                    { value: "Supplier", label: '{"en":"Supplier"}' },
                    { value: "Other", label: '{"en":"Others"}' }
                ],
                label: '{"en":"Party Type"}'
            },
            {
                id: 'party', type: 'dropdown', formComponentType: "select", options: [], canView: true, mandatory: true,
                showInTable: true, showInForm: true, sectionId: 'sectionDetails',
                label: '{"en":"Receive From Party"}'
            },
            { id: 'postingDate', type: 'datetime', mandatory: true, label: '{"en":"Posting Date"}', showInTable: true, showInForm: true, showInFilter: true, sectionId: 'sectionDetails' },
            {
                id: 'paymentMethod', type: "link", showInForm: true, label: '{"en":"Payment Methods"}',
                sectionId: 'sectionDetails', options: "company_account",
                linkOptions: { isDoc: true, valueField: "id", labelField: "name" },
            },
            { id: 'amount', type: 'currency', defaultValue: 0, label: '{"en":"Amount"}', showInForm: true, showInTable: true, sectionId: 'sectionDetails' },
            { id: 'refNo', type: 'text', label: '{"en":"Reference No"}', showInForm: true, sectionId: 'sectionDetails' },
            { id: 'refDate', type: 'date', label: '{"en":"Reference Date"}', showInForm: true, sectionId: 'sectionDetails' },
            { id: 'description', type: "textarea", label: '{"en":"Description"}', showInForm: true, sectionId: 'sectionDetails' },
            { id: 'remark', type: "textarea", label: '{"en":"Remark"}', showInForm: true, sectionId: 'sectionDetails' },

            { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})


export async function afterSubmit(data: any, params: ApiParam, docType: DocumentType, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData?.docStatus != 'DRAFT') {
        return data;
    }
    switch (previousData.partyType) {
        case "Customer":
            await receiveCustomerPayment(previousData, params, mysqlConn);
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
        remark: "",
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
    const saveSIParams: ApiGetParam = {
        ...params,
        tableName: "sales_invoice",
        method: ApiRequestMethod.GET_LIST,
        selectFields: ["id", "amount"],
        customWhereQuery: `  WHERE customerId= '${payment.customerId}' AND (paymentStatus!='PAID' OR paidAmount !=grandTotal)`,
        sorting: { sortBy: OrderBy.ASC, sortField: "postingDate" },
        listOnly: true
    }
    const unpaidSI = await globalService.getDocumentList(saveSIParams, mysqlConn);

    const paidInvoice = [];
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
            paidAmount: paidAmount
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
            balanceAmount: remainingPaidAmount,
            refDoc: payment.id,
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