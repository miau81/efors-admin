import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "purchase_invoice",
        label: '{"en":"Purchase Invoice"}',
        namingType: "sequence",
        namingFormat: "PINV{YYYY}-{0000}",
        searchFields: ["id"],
        canSubmit: true,
        printScript: "SERVER",
        defaultSorting: 'createdDate',
        defaultSortBy: "DESC",
        printFormats: [
            { code: "STD_PURCHASE_INVOICE", fileName: "standard_purchase_invoice", label: '{"en":"Standard Purchase Invoice"}', isDefault: true },
        ],
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
                id: 'supplierId', type: 'link', options: "supplier", canAddNew: true, canView: true, mandatory: true, canEdit: true,
                showInTable: true, showInForm: true, sectionId: 'sectionDetails',
                linkOptions: { isDoc: true, valueField: "id", labelField: "name" },
                label: '{"en":"Supplier"}', showInFilter: true
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
                sectionId: 'sectionItems', options: "purchase_invoice_item", callClientScript: true
            },
            // Section Taxes
            {
                id: 'taxes', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Taxes/Additional Charges"}',
                sectionId: 'sectionChargesAndDiscount', options: "purchase_invoice_tax", callClientScript: true
            },
            {
                id: 'discounts', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Discounts"}',
                sectionId: 'sectionChargesAndDiscount', options: "purchase_invoice_discount", callClientScript: true
            },
            //Section Totals


            { id: 'subtotal', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Subtotal"}', showInForm: true, sectionId: 'sectionITotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'totalTaxes', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Total Taxes"}', showInForm: true, sectionId: 'sectionITotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'totalDiscounts', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Total Discounts"}', showInForm: true, sectionId: 'sectionITotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'roundingAmount', type: 'currency', isReadOnly: true, label: '{"en":"Rounding Amount"}', showInForm: true, defaultValue: 0, sectionId: 'sectionITotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'grandTotal', type: 'currency', isReadOnly: true, label: '{"en":"Grand Total"}', showInTable: true, defaultValue: 0, showInForm: true, sectionId: 'sectionITotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },

            // { id: 'remarks', type: 'text', label: '{"en":"Remarks"}', showInForm: true, sectionId: 'sectionITotal' },
            { id: 'companyId', type: 'text', isHidden: true },

            //Section E-Invoice
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})