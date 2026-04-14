
import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";




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
            { id: 'sectionCustomer', sectionExpanded: true, label: '{"en":"Customer Details"}', sorting: 2 },
            { id: 'sectionItems', label: '{"en":"Items"}', sorting: 3 },
            { id: 'sectionChargesAndDiscount', sectionExpanded: false, label: '{"en":"Charges And Discount"}', sorting: 4 },
            { id: 'sectionTotal', label: '{"en":"Total"}', sorting: 5 },
            { id: 'sectionPaymentStatus', label: '{"en":"Payment Status"}', sorting: 5, sectionExpanded: false },
        ],
        fields: [

            // { id: "id", type: "text", label: '{"en":"Invoice No"}', showInTable: true, showInForm: true, isReadOnly: true, isPrimaryKey: true, showInFilter: true, sectionId: 'sectionDetails' },
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
                id: 'customerId', type: 'link', options: "customer", canAddNew: true, canView: true, mandatory: true, canEdit: true,
                showInTable: true, showInForm: true, sectionId: 'sectionDetails',
                linkOptions: { isDoc: true, valueField: "id", labelField: "name" },
                label: '{"en":"Customer"}', showInFilter: true
            },
            { id: 'postingDate', type: 'datetime', mandatory: true, label: '{"en":"Posting Date"}', showInTable: true, showInForm: true, showInFilter: true, sectionId: 'sectionDetails' },

            // Customer Details
            { id: 'customerName', type: 'text', mandatory: true, label: '{"en":"Name"}', showInTable: true, showInForm: true, sectionId: 'sectionCustomer' },
            { id: 'contactNo', type: 'text', mandatory: true, label: '{"en":"Contact No"}', showInTable: true, showInForm: true, sectionId: 'sectionCustomer' },
            { id: 'email', type: 'text', formComponentType: "email", mandatory: true, label: '{"en":"Email"}', showInTable: true, showInForm: true, sectionId: 'sectionCustomer' },
            { id: 'tinNo', type: 'text', label: '{"en":"Tin No"}', showInTable: true, showInForm: true, sectionId: 'sectionCustomer' },
            { id: 'identificationNo', type: 'text', label: '{"en":"I/C| Passport | Business Reg. No"}', showInForm: true, sectionId: 'sectionCustomer' },
            {
                id: 'identificationType', type: 'link', options: "einvoice_id_type", showInForm: true,
                linkOptions: { valueField: "id", labelField: "id,name" },
                label: '{"en":"Identification Type"}', sectionId: 'sectionCustomer'
            },
            { id: 'sstRegistration', type: 'text', label: '{"en":"SST Registration No"}', showInForm: true, sectionId: 'sectionCustomer' },


            { id: 'address1', type: 'text', label: '{"en":"Address 1"}', showInForm: true, sectionId: "sectionCustomer" },
            { id: 'address2', type: 'text', label: '{"en":"Address 2"}', showInForm: true, sectionId: "sectionCustomer" },
            { id: 'address3', type: 'text', label: '{"en":"Address 3"}', showInForm: true, sectionId: "sectionCustomer" },
            { id: 'postcode', type: 'text', label: '{"en":"Postcode"}', showInForm: true, sectionId: "sectionCustomer" },
            { id: 'city', type: 'text', label: '{"en":"City"}', showInForm: true, sectionId: "sectionCustomer" },
            {
                id: 'stateCode', type: 'link', options: "state", showInForm: true,
                linkOptions: { valueField: "einvoice_code", labelField: "name" },
                label: '{"en":"State"}', sectionId: "sectionCustomer"
            },
            {
                id: 'countryCode', type: 'link', options: "country", defaultValue: "MYS", showInForm: true,
                linkOptions: { valueField: "einvoice_code", labelField: "name" },
                label: '{"en":"Country"}', sectionId: "sectionCustomer"
            },

            //Section Return 
            // { id: 'sectionReturn', type: 'section', label: '{"en":"Return"}', sorting: 2, sectionExpanded: false },
            // { id: 'isReturn', type: 'boolean', defaultValue: false, label: '{"en":"Is Return"}', showInTable: true, showInForm: true, sectionId: 'sectionReturn' },
            // { id: 'returnAganist', type: 'text', isReadOnly: true, label: '{"en":"Return Aganist"}', showInForm: true, sectionId: 'sectionReturn' },
            //Section sub Tables

            // Section Items
             {
                id: 'itemId', type: 'link', options: "item", showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" }, isVirtual:true,
                label: '{"en":"Item Id"}', sectionId: 'sectionItems'
            },
            {
                id: 'items', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Items"}',
                sectionId: 'sectionItems', options: "sales_invoice_item", callClientScript: true, 
            },
            // Section Taxes
            {
                id: 'chargeAndDiscount', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Taxes/Additional Charges"}',
                sectionId: 'sectionChargesAndDiscount', options: "sales_invoice_charge_discount", callClientScript: true
            },


            { id: 'subtotal', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Subtotal(Esc.Tax)"}', showInForm: true, sectionId: 'sectionTotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'totalTaxes', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Total Taxes"}', showInForm: true, sectionId: 'sectionTotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'totalCharges', type: 'currency', isReadOnly: true, callClientScript: true, defaultValue: 0, label: '{"en":"Additional Charge"}', showInForm: true, sectionId: 'sectionTotal' , formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8"},
            { id: 'totalDiscounts', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Additional Discount"}', showInForm: true, sectionId: 'sectionTotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'roundingAmount', type: 'currency', isReadOnly: true, label: '{"en":"Rounding Amount"}', showInForm: true, defaultValue: 0, sectionId: 'sectionTotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },
            { id: 'grandTotal', type: 'currency', isReadOnly: true, label: '{"en":"Grand Total"}', showInTable: true, defaultValue: 0, showInForm: true, sectionId: 'sectionTotal', formColumnSize: "col-12 col-md-6 col-lg-4 offset-sm-6 offset-md-8" },

            // { id: 'remarks', type: 'text', label: '{"en":"Remarks"}', showInForm: true, sectionId: 'sectionTotal' },
            { id: 'companyId', type: 'text', isHidden: true },
            { id: "paymentStatus", type: "text", label: '{"en":"Payment Status"}', showInTable: true, showInForm: true, isReadOnly: true, sectionId: 'sectionPaymentStatus', defaultValue: 'UNPAID' },
            { id: 'paidAmount', type: 'currency', isReadOnly: true, label: '{"en":"Paid Amont"}', showInTable: true, defaultValue: 0, showInForm: true, sectionId: 'sectionPaymentStatus' },


            //Section E-Invoice
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})

