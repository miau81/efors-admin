import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "item",
        label: '{"en":"Item"}',
        namingType: "field",
        namingFormat: "sku",
        searchFields: ["sku", "name"],
        tabs: [
            { id: 'tabDetails', label: '{"en":"Details"}', sorting: 1 },
            { id: 'tabSales', label: '{"en":"Sales"}', sorting: 1 },
            { id: 'tabPurchase', label: '{"en":"Purchase"}', sorting: 1 },
            { id: 'tabEinvoice', label: '{"en":"E-Invoice Settings"}', sorting: 2 },
        ],
        sections: [
            { id: 'sectionDetails', label: '', sorting: 1, parent: 'tabDetails' },
            { id: 'sectionSales', label: '', sorting: 1, parent: 'tabSales' },
            { id: 'sectionPurchase', label: '', sorting: 1, parent: 'tabPurchase' },
            { id: 'sectionEinvoice', label: '', sorting: 2, parent: 'tabEinvoice' },
        ],
        fields: [
            { id: 'isActive', type: 'boolean', defaultValue: true, label: '{"en":"Avaliable"}', showInForm: true, sectionId: 'sectionDetails' },
            { id: 'break_1', type: 'breakline', showInForm: true, sectionId: 'sectionDetails' },
            { id: 'sku', type: 'text', mandatory: true, isNotEditable: true, label: '{"en":"SKU"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'name', type: 'text', mandatory: true, label: '{"en":"Name"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'description', type: 'text', formColumnSize: "col-12", formComponentType: "textarea", label: '{"en":"Description"}', showInForm: true, sectionId: 'sectionDetails' },
            {
                id: 'type', type: 'text', isNotEditable: true, mandatory: true, formComponentType: "select", showInTable: true, showInForm: true,
                options: [
                    { value: "NORMAL", label: '{"en":"Normal"}' },
                    { value: "BUNDLE", label: '{"en":"Bundle"}' },
                    { value: "SERVICE", label: '{"en":"Service Item"}' }
                ],
                label: '{"en":"Item Type"}', sectionId: 'sectionDetails', defaultValue: "NORMAL"
            },
            {
                id: 'itemGroupId', type: 'link', options: "item_group", canAddNew: true, mandatory: true, showInTable: true, showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"Item Group"}', sectionId: 'sectionDetails'
            },
            { id: 'maintainStock', mandatory: true, defaultValue: 1, type: 'boolean', label: '{"en":"Maintain Stock"}', showInForm: true, sectionId: 'sectionDetails' },
            {
                id: 'defaultUOM', type: 'link', options: "uom", canAddNew: true, mandatory: true, showInTable: true, showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"Default UOM"}', sectionId: 'sectionDetails'
            },
            {
                id: 'barcodes', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table",
                label: '{"en":"Item Barcodes"}',
                sectionId: 'sectionDetails', options: "item_barcode"
            },
            {
                id: 'bundleItems', type: "table", isNotEditable: true, formColumnSize: "col-12", showInForm: true, formComponentType: "table",
                label: '{"en":"Bundle Items"}',
                sectionId: 'sectionDetails', options: "bundle_item"
            },


            // Section Sales
            { id: 'allowSales', defaultValue: true, type: 'boolean', label: '{"en":"Allow Sales"}', showInForm: true, sectionId: 'sectionSales' },
            { id: 'break_2', type: 'breakline', showInForm: true, sectionId: 'sectionSales' },
            {
                id: 'defaultSaleUOM', type: 'link', options: "uom", canAddNew: true, showInTable: true, showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"Default Sales UOM"}', sectionId: 'sectionSales'
            },
            { id: 'defaultSellingPrice', type: 'currency',  label: '{"en":"Default Selling Price"}', showInTable: true, showInForm: true, sectionId: 'sectionSales' },
            {
                id: 'sellingTaxId', type: 'link', options: "tax_class", showInForm: true,
                linkOptions: { valueField: "id", labelField: "name", filters: [{ field: "enableForSales", operator: "=", value: true }] },
                label: '{"en":"Selling Tax Class"}', sectionId: 'sectionSales'
            },

            // Section Purchase
            { id: 'allowPurchase', defaultValue: true, type: 'boolean', label: '{"en":"Allow Purchase"}', showInForm: true, sectionId: 'sectionPurchase' },
            { id: 'break_3', type: 'breakline', showInForm: true, sectionId: 'sectionPurchase' },
            {
                id: 'defaultPurchaseUom', type: 'link', options: "uom", canAddNew: true, showInTable: true, showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"Default Purchase UOM"}', sectionId: 'sectionPurchase'
            },
            { id: 'defaultPurchasingPrice', type: 'currency', label: '{"en":"Default Purchasing Price"}', showInTable: true, showInForm: true, sectionId: 'sectionSales' },
            {
                id: 'purchasingTaxId', type: 'link', options: "tax_class", showInForm: true,
                linkOptions: { valueField: "id", labelField: "name", filters: [{ field: "enableForPurchases", operator: "=", value: true }] },
                label: '{"en":"Purchasing Tax Class"}', sectionId: 'sectionPurchase'
            },

            //E-invoice Section

            {
                id: 'eInvoiceUOM', type: 'link', options: "einvoice_item_uom", showInForm: true,
                linkOptions: { valueField: "id", labelField: "id,name" },
                label: '{"en":"E-Invoice UOM"}', sectionId: 'sectionEinvoice'
            },
            {
                id: 'eInvoiceClassfication', type: 'link', options: "einvoice_classification", showInForm: true,
                linkOptions: { valueField: "id", labelField: "id,name" },
                label: '{"en":"E-Invoice Classification"}', sectionId: 'sectionEinvoice'
            },
            { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})