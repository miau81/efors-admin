import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";




export const documentType = (() => {
    const type: MyERPDocType = {
        id: "company_account",
        label: '{"en":"Company Account"}',
        namingType: "byField",
        namingFormat: "name",
        searchFields: [],
        isChildTable: true,
        sections: [{ id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1 }],
        fields: [
            { id: 'companyId', type: 'text', label: '{"en":"Company ID"}', isHidden: true, sectionId: 'sectionDetails', isReadOnly: true, parentField: "id" },
            { id: 'break_1', type: 'breakline', sectionId: 'sectionDetails' },
            { id: 'id', type: "text", label: '{"en":"Code"}', showInForm: true, showInTable: true, isReadOnly: true, sectionId: 'sectionDetails' },
            { id: 'name', type: "text", label: '{"en":"Account Name"}', showInForm: true, showInTable: true, sectionId: 'sectionDetails' },


            //Section E-Invoice
        ]
    }
    type.fields = [...myErpFields.filter(df =>  !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})


