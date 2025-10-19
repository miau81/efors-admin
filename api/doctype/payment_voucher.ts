import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "payment_voucher",
        label: '{"en":"Payment Voucher"}',
        namingType: "sequence",
        namingFormat: "PV-{YYYY}-{0000}",
        searchFields: ["id"],
        canSubmit: true,
        printScript: "SERVER",
        defaultSorting: 'createdDate',
        defaultSortBy: "DESC",
        printFormats: [
            { code: "STD_PAYMENT_VOUCHER", fileName: "standard_payment_voucher", label: '{"en":"Standard Payment Voucher"}', isDefault: true },
        ],
        sections: [
            { id: 'sectionDetails', label: '', sorting: 1 },
            { id: 'sectionPaymentMethod', label: '{"en":"Payment Method"}', sorting: 2 },
            { id: 'sectionInv', label: '{"en":"Pay For Invoice"}', sorting: 2 },
        ],
        fields: [
            { id: "id", type: "text", label: '{"en":"Payment No"}', showInTable: true, showInForm: true, isReadOnly: true, isPrimaryKey: true, showInFilter: true, sectionId: 'sectionDetails' },
            {
                id: "docStatus", type: "text", formComponentType: "select", sectionId: 'sectionDetails',
                showInTable: true, defaultValue: 'DRAFT', label: '{"en":"Status"}', showInFilter: true,
                options: [
                    { value: "DRAFT", label: '{"en":"Draft"}' },
                    { value: "SUBMIT", label: '{"en":"Submit"}' },
                    { value: "CANCELLED", label: '{"en":"Cancelled"}' }
                ],
            },
             {
                id: 'partyType', type: 'dropdown', formComponentType: "select", mandatory: true,
                showInTable: true, showInForm: true, sectionId: 'sectionDetails', callServerScript: true,
                options: [
                    { value: "Customer", label: '{"en":"Customer"}' },
                    { value: "Supplier", label: '{"en":"Supplier"}' },
                    { value: "Others", label: '{"en":"Other"}' }
                ],
                label: '{"en":"Party Type"}'
            },
            {
                id: 'party', type: 'dropdown', formComponentType: "select", options: [], canView: true, mandatory: true,
                showInTable: true, showInForm: true, sectionId: 'sectionDetails',
                label: '{"en":"Receive From Party"}'
            },
            { id: 'postingDate', type: 'datetime', mandatory: true, label: '{"en":"Posting Date"}', showInTable: true, showInForm: true, showInFilter: true, sectionId: 'sectionDetails' },
             {
                id: 'paymentMethod', type: "link", showInForm: true, label: '{"en":"Payment Methods"}',
                sectionId: 'sectionDetails', options: "company_account",
                linkOptions: { isDoc: true, valueField: "id", labelField: "name" },
            },
            { id: 'refNo', type: 'text', label: '{"en":"Reference No"}', showInForm: true, sectionId: 'sectionDetails' },
            { id: 'refDate', type: 'date', label: '{"en":"Reference Date"}', showInForm: true, sectionId: 'sectionDetails' },
            { id: 'description', type: "textarea", label: '{"en":"Description"}', showInForm: true, sectionId: 'sectionDetails' },
            { id: 'remark', type: "textarea", label: '{"en":"Remark"}', showInForm: true, sectionId: 'sectionDetails' },

            { id: 'companyId', type: 'text', isHidden: true },


        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})