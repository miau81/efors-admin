import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";




export const documentType = (() => {
    const type: MyERPDocType = {
        id: "Account",
        label: '{"en":"Account"}',
        namingType: "byField",
        namingFormat: "name",
        searchFields: [],
        fields: [
            { id: 'code', type: "text", label: '{"en":"Code"}', showInForm: true, showInTable: true, isNotEditable:true },
            { id: 'name', type: "text", label: '{"en":"Account Name"}', showInForm: true, showInTable: true},
            //Section E-Invoice
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})


