import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "user_access_branch",
        label: '{"en":"User Access Branch"}',
        namingType: "random",
        fields: [
            {
                id: 'userId', type: 'text', isHidden: true, parentField: "company"
            },
            {
                id: 'branchId', type: 'link', options: "branch", showInForm: true, showInTable:true,
                linkOptions: { valueField: "id", labelField: "branchName" },
                label: '{"en":"Branch"}'
            },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})



