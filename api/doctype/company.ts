import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "company",
        label: '{"en":"Company"}',
        namingType: "field",
        namingFormat: "code",
        searchFields: [],
        tabs: [
            { id: 'tabDetails', label: '{"en":"Details"}', sorting: 2, sectionExpanded: false },
            { id: 'tabAccount', label: '{"en":"Account"}', sorting: 2, sectionExpanded: false },
        ],
        sections: [
            { id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1, parent: "tabDetails" },
            { id: 'sectionAccount', label: '{"en":"Branch Access"}', sorting: 1, parent: "tabAccount" }
        ],
        fields: [
            { id: 'code', type: "text", label: '{"en":"Code"}', mandatory: true, isUnique: true, showInForm: true, showInTable: true,sectionId:"sectionDetails" },
            { id: 'name', type: "text", label: '{"en":"Name"}', mandatory: true, showInForm: true, showInTable: true ,sectionId:"sectionDetails"},
            { id: 'expiredDate', type: "date", label: '{"en":"Expiry Date"}', mandatory: true, showInForm: true, showInTable: true ,sectionId:"sectionDetails"},
            // { id: 'agent', type: "date", label: '{"en":"Expiry Date"}', showInForm: true, showInTable: true ,sectionId:"sectionDetails"},
           
            // Section Account
            {
                id: 'accounts', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Accounts"}',
                sectionId: 'sectionAccount', options: "company_account", callClientScript: true
            },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})