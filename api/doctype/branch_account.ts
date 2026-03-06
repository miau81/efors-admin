import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";




export const documentType = (() => {
    const type: MyERPDocType = {
        id: "Branch Account",
        label: '{"en":"Branch Account"}',
        namingType: "random",
        searchFields: [],
        fields: [
            {
                id: 'branchId', type: 'link', options: "branch", showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"Branch"}'
            },
            {
                id: 'accountId', type: 'link', options: "account", showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"Account"}'
            },
            { id: 'sorting', type: "number", label: '{"en":"Sorting"}', showInForm: true, showInTable: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})


