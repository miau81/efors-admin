import dayjs from "dayjs";
import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiRequestMethod } from "../../src/api/interfaces/api.enum";
import { ApiParam, ApiSaveParam } from "../../src/api/interfaces/api.main.interface";
import { ApiGlobalService } from "../../src/api/services/api.global.service";
import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

const globalService = new ApiGlobalService();


export const documentType = (() => {
    const type: MyERPDocType = {
        id: "sales_invoice",
        label: '{"en":"Sales Invoice"}',
        namingType: "sequence",
        namingFormat: "SINV-{YYYY}-{0000}",
        searchFields: ["code", "name"],
        canSubmit: true,
        printScript: "SERVER",
        defaultSorting: 'createdDate',
        defaultSortBy: "DESC",
        printFormats: [
            { code: "STD_SALES_INVOICE", fileName: "standard_sales_invoice", label: '{"en":"Standard Sales Invoice"}', isDefault: true },],
        sections: [
            { id: 'sectionDetails', label: '', sorting: 1 },
            { id: 'sectionItems', label: '{"en":"Items"}', sorting: 3 },
            { id: 'sectionChargesAndDiscount', sectionExpanded: false, label: '{"en":"Charges And Discount"}', sorting: 4 },
            { id: 'sectionITotal', label: '{"en":"Total"}', sorting: 5 },
        ],
        fields: [
            { id: "id", type: "text", label: '{"en":"Invoice No"}', showInTable: true, showInForm: true, isReadOnly: true, isPrimaryKey: true, showInFilter: true, sectionId: 'sectionDetails' },
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
                id: 'customer', type: 'link', options: "customer", canAddNew: true, canView: true, mandatory: true, canEdit: true,
                showInTable: true, showInForm: true, sectionId: 'sectionDetails',
                linkOptions: { isDoc: true, valueField: "id", labelField: "name" },
                label: '{"en":"Customer"}', showInFilter: true
            },
            { id: 'postingDate', type: 'datetime', mandatory: true, label: '{"en":"Posting Date"}', showInTable: true, showInForm: true, showInFilter: true, sectionId: 'sectionDetails' },

            //Section Return 
            // { id: 'sectionReturn', type: 'section', label: '{"en":"Return"}', sorting: 2, sectionExpanded: false },
            // { id: 'isReturn', type: 'boolean', defaultValue: false, label: '{"en":"Is Return"}', showInTable: true, showInForm: true, sectionId: 'sectionReturn' },
            // { id: 'returnAganist', type: 'text', isReadOnly: true, label: '{"en":"Return Aganist"}', showInForm: true, sectionId: 'sectionReturn' },
            //Section sub Tables

            // Section Items
            {
                id: 'items', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Items"}',
                sectionId: 'sectionItems', options: "sales_invoice_item", callClientScript: true
            },
            // Section Taxes
            {
                id: 'taxes', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Taxes/Additional Charges"}',
                sectionId: 'sectionChargesAndDiscount', options: "sales_invoice_tax", callClientScript: true
            },
            {
                id: 'discounts', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Discounts"}',
                sectionId: 'sectionChargesAndDiscount', options: "sales_invoice_discount", callClientScript: true
            },
            //Section Totals


            { id: 'subtotal', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Subtotal"}', showInForm: true, sectionId: 'sectionITotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'totalTaxes', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Total Taxes"}', showInForm: true, sectionId: 'sectionITotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            // { id: 'totalCharges', type: 'currency', isReadOnly: true, callClientScript: true, defaultValue: 0, label: '{"en":"Total Charges"}', showInForm: true, sectionId: 'sectionITotal' },
            { id: 'totalDiscounts', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Total Discounts"}', showInForm: true, sectionId: 'sectionITotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'roundingAmount', type: 'currency', isReadOnly: true, label: '{"en":"Rounding Amount"}', showInForm: true, defaultValue: 0, sectionId: 'sectionITotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'grandTotal', type: 'currency', isReadOnly: true, label: '{"en":"Grand Total"}', showInTable: true, defaultValue: 0, showInForm: true, sectionId: 'sectionITotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },

            // { id: 'remarks', type: 'text', label: '{"en":"Remarks"}', showInForm: true, sectionId: 'sectionITotal' },
            { id: 'companyId', type: 'text', isHidden: true },
            { id: 'paymentStatus', type: 'text', isHidden: true },
            { id: 'paidAmount', type: 'text', isHidden: true },

            //Section E-Invoice
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})

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