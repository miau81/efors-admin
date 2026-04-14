import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "sales_invoice_charge_discount",
        label: '{"en":"Invoice Charge and Discount"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        isChildTable: true,
        sections: [{ id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1 },],
        fields: [

            { id: 'invoiceId', type: 'text', label: '{"en":"Item ID"}', sectionId: 'sectionDetails', isHidden: true, parentField: "sales_invoice" },
            { id: 'description', type: 'text', mandatory: true, label: '{"en":"Description"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            {
                id: 'type', type: 'text', formComponentType: "select", showInTable: true, showInForm: true, callClientScript: true,
                options: [
                    { value: "CHARGE", label: '{"en":"Charge"}' },
                    { value: "DISCOUNT", label: '{"en":"Discount"}' }
                ],
                defaultValue: "CHARGE",
                mandatory: true, label: '{"en":"Type"}', sectionId: 'sectionDetails'
            },
            { id: 'rate', type: 'currency', mandatory: true, defaultValue: 0, label: '{"en":"Rate"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails', callClientScript: true },
            { id: 'amount', type: 'currency', isReadOnly: false, defaultValue: 0, label: '{"en":"Amount"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})