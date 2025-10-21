import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "company_acct_tranx",
        label: '{"en":"Company Account Transaction"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        isChildTable: true,
        sections: [],
        fields: [
            { id: 'companyId', type: 'text', isHidden: true },
            { id: 'accountId', type: 'text', isHidden: true },
            { id: 'transactionType', type: 'text', isHidden: true },
            { id: 'description', type: 'text', isHidden: true },
            { id: 'refDoc', type: 'text', isHidden: true },
            { id: 'refNo', type: 'text', isHidden: true },
            { id: 'remark', type: 'text', isHidden: true },
            { id: 'amount', type: 'text', isHidden: true },
             { id: 'postingDate', type: 'datetime', isHidden: true }
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})