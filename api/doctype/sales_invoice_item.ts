import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "sales_invoice_item",
        label: '{"en":"Invoice Item"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        sections: [{ id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1 }],
        isChildTable: true,
        fields: [
            { id: 'invoiceId', isHidden: true, type: 'text', label: '{"en":"Invoice ID"}', sectionId: 'sectionDetails', isReadOnly: true, parentField: "id" },
            {
                id: 'itemId', type: 'link', options: "item", showInTable: true, showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"Item"}', sectionId: 'sectionDetails', callServerScript: true
            },
            { id: 'name', type: 'text', mandatory: true, label: '{"en":"Item Name"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'quantity', type: 'number', mandatory: true, label: '{"en":"Quantity"}', defaultValue: 1, showInTable: true, showInForm: true, sectionId: 'sectionDetails', callClientScript: true },
            { id: 'unitPrice', type: 'currency', mandatory: true, label: '{"en":"Unit Price"}', defaultValue: 0, showInTable: true, showInForm: true, sectionId: 'sectionDetails', callClientScript: true },
            {
                id: 'classfication', type: 'link', options: "einvoice_classification", showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"Classification"}', sectionId: 'sectionDetails'
            },
            {
                id: 'uom', type: 'link', options: "item_uom", canAddNew: true, mandatory: true, showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"UOM"}', sectionId: 'sectionDetails'
            },
            { id: 'amount', type: 'currency', isReadOnly: true, label: '{"en":"Amount"}', defaultValue: 0, showInTable: true, showInForm: true, sectionId: 'sectionDetails' },

        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})