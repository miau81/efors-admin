import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "receiving_voucher",
        label: '{"en":"Receiving Voucher"}',
        namingType: "sequence",
        namingFormat: "RV-{YYYY}-{0000}",
        searchFields: ["code", "name"],
        canSubmit: true,
        printScript: "SERVER",
        defaultSorting: 'createdDate',
        defaultSortBy: "DESC",
        printFormats: [
            { code: "STD_RECEIVING_VOUCHER", fileName: "standard_receiving_voucher", label: '{"en":"Standard Receiving Voucher"}', isDefault: true },
        ],
        sections: [
            { id: 'sectionDetails', label: '', sorting: 1 }
        ],
        fields: [
            // { id: "id", type: "text", label: '{"en":"Receipt No"}', showInTable: true, showInForm: true, isReadOnly: true, isPrimaryKey: true, showInFilter: true, sectionId: 'sectionDetails' },
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
                    { value: "CUSTOMER", label: '{"en":"Customer"}' },
                    { value: "SUPPLIER", label: '{"en":"Supplier"}' },
                    { value: "OTHER", label: '{"en":"Others"}' }
                ],
                label: '{"en":"Party Type"}'
            },
            {
                id: 'partyId', type: 'dropdown', formComponentType: "select", options: [], canView: true, mandatory: true,
                showInTable: true, showInForm: true, sectionId: 'sectionDetails',
                label: '{"en":"Receive From Party"}'
            },
            { id: 'postingDate', type: 'datetime', mandatory: true, label: '{"en":"Posting Date"}', showInTable: true, showInForm: true, showInFilter: true, sectionId: 'sectionDetails' },
            {
                id: 'paymentMethod', type: "link", showInForm: true, label: '{"en":"Payment Methods"}',
                sectionId: 'sectionDetails', options: "company_account",
                linkOptions: { isDoc: true, valueField: "id", labelField: "name" },
            },
            { id: 'amount', type: 'currency', defaultValue: 0, label: '{"en":"Amount"}', showInForm: true, showInTable: true, sectionId: 'sectionDetails' },
            { id: 'refNo', type: 'text', label: '{"en":"Reference No"}', showInForm: true, sectionId: 'sectionDetails' },
            { id: 'refDate', type: 'date', label: '{"en":"Reference Date"}', showInForm: true, sectionId: 'sectionDetails' },

            { id: 'description',mandatory:false, type: "text", label: '{"en":"Description"}',  sectionId: 'sectionDetails', formColumnSize:'col-12' },

            { id: 'remark', type: "textarea", label: '{"en":"Remark"}', showInForm: true, sectionId: 'sectionDetails',formColumnSize:'col-12' },

            { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})

