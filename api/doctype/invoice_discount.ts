import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "invoice_discount",
        label: '{"en":"Invoice Charge and Discount"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        isChildTable: true,
        fields: [...myErpFields,
        { id: 'sectionDetails', type: 'section', label: '{"en":"Details"}', sorting: 1 },
        { id: 'invoiceId', type: 'text', label: '{"en":"Item ID"}', sectionId: 'sectionDetails', isHidden: true, parentField: "id" },
        // {
        //     id: 'type', type: 'text', formComponentType: "select", showInTable: true, showInForm: true,
        //     options: [
        //         { value: "CHARGE", label: '{"en":"Charge"}' },
        //         { value: "DISCOUNT", label: '{"en":"Discount"}' }
        //     ],
        //     defaultValue: "DISCOUNT",
        //     mandatory: true, label: '{"en":"Type"}', sectionId: 'sectionDetails'
        // },
        { id: 'discription', type: 'text', mandatory: true, label: '{"en":"Discription"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
        {
            id: 'discountBy', type: 'text', formComponentType: "select", showInTable: true, showInForm: true, callClientScript: true,
            options: [
                { value: "PERCENTAGE", label: '{"en":"Percentage"}' },
                { value: "AMOUNT", label: '{"en":"Amount"}' }
            ],
            defaultValue: "PERCENTAGE",
            mandatory: true, label: '{"en":"Discount By"}', sectionId: 'sectionDetails'
        },
        { id: 'rate', type: 'number', mandatory: true, defaultValue:0, label: '{"en":"Discount Rate"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails', callClientScript: true },
        { id: 'amount', type: 'currency', isReadOnly: true, defaultValue:0, label: '{"en":"Amount"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
        ]
    }
    return type;
})