import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "purchase_invoice_discount",
        label: '{"en":"Invoice Charge and Discount"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        isChildTable: true,
        sections: [{ id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1 },],
        fields: [

            { id: 'invoiceId', type: 'text', label: '{"en":"Item ID"}', sectionId: 'sectionDetails', isHidden: true, parentField: "id" },
            { id: 'description', type: 'text', mandatory: true, label: '{"en":"Description"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            {
                id: 'discountBy', type: 'text', formComponentType: "select", showInTable: true, showInForm: true, callClientScript: true,
                options: [
                    { value: "PERCENTAGE", label: '{"en":"Percentage"}' },
                    { value: "AMOUNT", label: '{"en":"Amount"}' }
                ],
                defaultValue: "PERCENTAGE",
                mandatory: true, label: '{"en":"Discount By"}', sectionId: 'sectionDetails'
            },
            { id: 'rate', type: 'currency', mandatory: true, defaultValue: 0, label: '{"en":"Discount Rate"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails', callClientScript: true },
            { id: 'amount', type: 'currency', isReadOnly: true, defaultValue: 0, label: '{"en":"Amount"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})