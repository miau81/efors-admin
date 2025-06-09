import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "invoice_tax",
        label: '{"en":"Invoice Tax"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        isChildTable: true,
        fields: [...myErpFields,
        { id: 'sectionDetails', type: 'section', label: '{"en":"Details"}', sorting: 1 },
        { id: 'invoiceId', type: 'text', label: '{"en":"Item ID"}', isHidden: true, sectionId: 'sectionDetails', isReadOnly: true, parentField: "id" },
        { id: 'break_1', type: 'breakline', sectionId: 'sectionDetails' },
        {
            id: 'taxId', type: 'link', options: "tax", showInTable: true, showInForm: true,
            linkOptions: { valueField: "id", labelField: "name" },
            label: '{"en":"Tax"}', sectionId: 'sectionDetails',
            callServerScript: true
        },
        { id: 'name', type: 'text', mandatory: true, label: '{"en":"Name"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
        {
            id: 'chargeBy', type: 'dropdown', formComponentType: "select", showInTable: true, showInForm: true,
            options: [
                { value: "PERCENTAGE", label: '{"en":"Percentage"}' },
                { value: "AMOUNT", label: '{"en":"Amount"}' }
            ],
            defaultValue: "PERCENTAGE", callClientScript: true,
            mandatory: true, label: '{"en":"Charge By"}', sectionId: 'sectionDetails'
        },
        { id: 'rate', type: 'number', defaultValue: 0, mandatory: true, label: '{"en":"Charge Rate"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails', callClientScript: true },

        {
            id: 'taxableType', type: 'link', options: "einvoice_taxable_type", showInForm: true,
            linkOptions: { valueField: "id", labelField: "name" },
            label: '{"en":"Taxable Type"}', sectionId: "sectionDetails"

        },
        { id: 'amount', type: 'currency', defaultValue: 0, isReadOnly: true, label: '{"en":"Amount"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
        ]
    }
    return type;
})