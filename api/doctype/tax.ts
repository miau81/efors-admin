import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "tax",
        label: '{"en":"Tax and Charges"}',
        namingType: "byField",
        namingFormat: "code",
        searchFields: ["code", "name"],
        fields: [...myErpFields,
        { id: 'sectionDetails', type: 'section', label: '{"en":"Details"}', sorting: 1 },
        { id: 'isActive', type: 'boolean', showInTable: true, showInForm: true, defaultValue: true, label: '{"en":"Is Active"}', sectionId: 'sectionDetails' },
        { id: 'break_1', type: 'breakline', sectionId: 'sectionDetails' },
        { id: 'code', type: 'text', showInTable: true, showInForm: true, mandatory: true, isNotEditable: true, label: '{"en":"Code"}', sectionId: 'sectionDetails' },
        { id: 'name', type: 'text', showInTable: true, showInForm: true, formComponentType: "text", isTranslatable: true, mandatory: true, label: '{"en":"Name"}', sectionId: 'sectionDetails' },
        {
            id: 'chargeBy', type: 'text', formComponentType: "select", showInTable: true, showInForm: true,
            options: [
                { value: "PERCENTAGE", label: '{"en":"Percentage"}' },
                { value: "AMOUNT", label: '{"en":"Amount"}' }
            ],
            defaultValue: "PERCENTAGE",
            mandatory: true, label: '{"en":"Charge By"}', sectionId: 'sectionDetails'
        },
        { id: 'rate', type: 'currency', mandatory: true, label: '{"en":"Charge Rate"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
        {
            id: 'einvoiceTaxableType', type: 'link', options: "einvoice_taxable_type", showInTable: true, showInForm: true,
            linkOptions: { valueField: "id", labelField: "id,name" },
            label: '{"en":"E-Invoice Taxable Type"}', sectionId: "sectionDetails"

        },
        { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    return type;
})