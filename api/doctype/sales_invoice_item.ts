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

            { id: 'name', type: 'text', mandatory: true, label: '{"en":"Item Name"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'quantity', type: 'number', mandatory: true, label: '{"en":"Quantity"}', defaultValue: 1, showInTable: true, showInForm: true, sectionId: 'sectionDetails', callClientScript: true },
            { id: 'unitPrice', type: 'currency', mandatory: true, label: '{"en":"Unit Price"}', defaultValue: 0, showInTable: true, showInForm: true, sectionId: 'sectionDetails', callClientScript: true },
            { id: 'amountExcTax', type: 'currency', isReadOnly: true, label: '{"en":"Amount exc.Tax"}', defaultValue: 0, showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'taxAmount', type: 'currency', isReadOnly: true, label: '{"en":"Tax Amount"}', defaultValue: 0, showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'totalAmount', type: 'currency', isReadOnly: true, label: '{"en":"Total Amount"}', defaultValue: 0, showInTable: true, showInForm: true, sectionId: 'sectionDetails' },

            {
                id: 'taxClass', type: 'text', options: "selling_tax", isReadOnly: true, isHidden: true,
                // linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"Tax Class"}', sectionId: 'sectionDetails'
            },
            {
                id: 'uom', type: 'link', options: "item_uom", isReadOnly: true, showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"UOM"}', sectionId: 'sectionDetails'
            },
            { id: 'classfication', isHidden: true, type: 'text', label: '{"en":"Classification"}', sectionId: 'sectionDetails' },
            { id: 'itemId', isHidden: true, type: 'text', label: '{"en":"Item"}', sectionId: 'sectionDetails' },
            { id: 'taxRate', isHidden: true, type: 'text', label: '{"en":"taxRate"}', sectionId: 'sectionDetails' },
            { id: 'taxChargeBy', isHidden: true, type: 'text', label: '{"en":"taxChargeBy"}', sectionId: 'sectionDetails' }

        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})