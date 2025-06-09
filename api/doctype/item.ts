import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "item",
        label: '{"en":"Item"}',
        namingType: "byField",
        namingFormat: "sku",
        searchFields: ["sku", "name"],
        fields: [...myErpFields,
        { id: 'sectionDetails', type: 'section', label: '{"en":"Details"}', sorting: 1 },
        { id: 'isActive', type: 'boolean', defaultValue: true, label: '{"en":"Avaliable"}', showInForm: true, sectionId: 'sectionDetails' },
        { id: 'nonTaxable', type: 'boolean', label: '{"en":"Non-Taxable"}', sectionId: 'sectionDetails' },
        { id: 'break_1', type: 'breakline', showInForm: true, sectionId: 'sectionDetails' },
        { id: 'sku', type: 'text', mandatory: true, isNotEditable: true, label: '{"en":"SKU"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
        { id: 'name', type: 'text', mandatory: true, label: '{"en":"Name"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
        {
            id: 'type', type: 'text', mandatory: true, formComponentType: "select", showInTable: true, showInForm: true,
            options: [
                { value: "NORMAL", label: '{"en":"Normal"}' },
                { value: "SERVICE", label: '{"en":"Service Item"}' }
            ],
            label: '{"en":"Item Type"}', sectionId: 'sectionDetails'
        },
        {
            id: 'uom', type: 'link', options: "item_uom", canAddNew: true, mandatory: true, showInTable: true, showInForm: true,
            linkOptions: { valueField: "id", labelField: "name" },
            label: '{"en":"UOM"}', sectionId: 'sectionDetails'
        },
        { id: 'unitPrice', mandatory: true, defaultValue: 0, type: 'currency', label: '{"en":"Unit Price"}', showInForm: true, sectionId: 'sectionDetails' },

        { id: 'description', type: 'text', formColumnSize: "col-12", formComponentType: "textarea", label: '{"en":"Description"}', showInForm: true, sectionId: 'sectionDetails' },

        // {
        //     id: 'prices', type: "table", formColumnSize: "col-12", formComponentType: "table", label: '{"en":"Prices"}',
        //    showInForm:true, sectionId: 'sectionDetails', options: "item_price"
        // },
        // { id: 'type', type: 'link', formComponentType:"email", mandatory: true, label: '{"en":"Email"}', sectionId: 'sectionDetails' },
        { id: 'sectionEinvoice', type: 'section', label: '{"en":"E-Invoice Settings"}', sorting: 2 },
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
    return type;
})