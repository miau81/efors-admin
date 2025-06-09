import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "invoice",
        label: '{"en":"Invoice"}',
        namingType: "sequence",
        namingFormat: "INV-{YYYYMM}-{000000}",
        searchFields: ["code", "name"],
        canSubmit: true,
        printScript: "SERVER",
        printFormats: [
            { code: "EINVOICE", fileName: "e-invoice.ejs", label: '{"en":"E-Invoice"}', isDefault: true },
            { code: "EINVOICE_SANDBOX", fileName: "e-invoice-sandbox.ejs", label: '{"en":"E-Invoice (Sandbox)"}' }
        ],
        fields: [...myErpFields,
        // { id: 'sectionDetails', type: 'section', label: '{"en":"Details"}', sorting: 1 },
        { id: "id", type: "text", label: '{"en":"Invoice No"}', showInTable: true, showInForm: true, isReadOnly: true, isPrimaryKey: true, showInFilter: true },
        {
            id: "docStatus", type: "text", formComponentType: "select",
            showInTable: true, defaultValue: 'DRAFT', label: '{"en":"Status"}', showInFilter: true,
            options: [
                { value: "DRAFT", label: '{"en":"Draft"}' },
                { value: "SUBMIT", label: '{"en":"Submit"}' },
                { value: "CANCELLED", label: '{"en":"Cancelled"}' }
            ],
        },
        {
            id: 'customer', type: 'link', options: "customer", canAddNew: true, canView: true, mandatory: true,
            showInTable: true, showInForm: true,
            linkOptions: {isDoc:true, valueField: "id", labelField: "name" },
            label: '{"en":"Customer"}', showInFilter: true
        },
        { id: 'postingDate', type: 'datetime', mandatory: true, label: '{"en":"Posting Date"}', showInTable: true, showInForm: true, showInFilter: true },

        //Section Return 
        // { id: 'sectionReturn', type: 'section', label: '{"en":"Return"}', sorting: 2, sectionExpanded: false },
        // { id: 'isReturn', type: 'boolean', defaultValue: false, label: '{"en":"Is Return"}', showInTable: true, showInForm: true, sectionId: 'sectionReturn' },
        // { id: 'returnAganist', type: 'text', isReadOnly: true, label: '{"en":"Return Aganist"}', showInForm: true, sectionId: 'sectionReturn' },
        //Section sub Tables
        { id: 'sectionItems', type: 'section', label: '{"en":"Items"}', sorting: 3 },
        {
            id: 'items', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Items"}',
            sectionId: 'sectionItems', options: "invoice_item", callClientScript: true
        },
        { id: 'sectionChargesAndDiscount', type: 'section', sectionExpanded: false, label: '{"en":"Charges And Discount"}', sorting: 4 },
        {
            id: 'taxes', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Taxes/Additional Charges"}',
            sectionId: 'sectionChargesAndDiscount', options: "invoice_tax", callClientScript: true
        },
        {
            id: 'discounts', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Discounts"}',
            sectionId: 'sectionChargesAndDiscount', options: "invoice_discount", callClientScript: true
        },
        //Section Totals
        { id: 'sectionITotal', type: 'section', label: '{"en":"Total"}', sorting: 5 },
        { id: 'subtotal', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Subtotal"}', showInForm: true, sectionId: 'sectionITotal' },
        { id: 'totalTaxes', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Total Taxes"}', showInForm: true, sectionId: 'sectionITotal' },
        // { id: 'totalCharges', type: 'currency', isReadOnly: true, callClientScript: true, defaultValue: 0, label: '{"en":"Total Charges"}', showInForm: true, sectionId: 'sectionITotal' },
        { id: 'totalDiscounts', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Total Discounts"}', showInForm: true, sectionId: 'sectionITotal' },
        { id: 'roundingAmount', type: 'currency', isReadOnly: true, label: '{"en":"Rounding Amount"}', showInForm: true, defaultValue: 0, sectionId: 'sectionITotal' },
        { id: 'grandTotal', type: 'currency', isReadOnly: true, label: '{"en":"Grand Total"}', showInTable: true, defaultValue: 0, showInForm: true, sectionId: 'sectionITotal' },

        // { id: 'remarks', type: 'text', label: '{"en":"Remarks"}', showInForm: true, sectionId: 'sectionITotal' },
        { id: 'companyId', type: 'text', isHidden: true },

            //Section E-Invoice
        ]
    }
    return type;
})