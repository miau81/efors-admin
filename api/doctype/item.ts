import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "item",
        label: '{"en":"Item"}',
        namingType: "byField",
        namingFormat: "sku",
        searchFields: ["sku", "name"],
        tabs: [
            { id: 'tabDetails', label: '{"en":"Details"}', sorting: 1 },
            { id: 'tabEinvoice', label: '{"en":"E-Invoice Settings"}', sorting: 2 },
        ],
        sections: [
            { id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1, parent: 'tabDetails' },
            { id: 'sectionEinvoice', label: '{"en":"E-Invoice Settings"}', sorting: 2, parent: 'tabEinvoice' },
        ],
        fields: [
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