import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "customer_advance_payment",
        label: '{"en":"Customer Advance Payment"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        isChildTable: true,
        sections: [],
        fields: [
            { id: 'companyId', type: 'text', isHidden: true },
            { id: 'customerId', type: 'text', isHidden: true },
            { id: 'receivingVoucherId', type: 'text', isHidden: true },
            { id: 'postingDate', type: 'datetime', isHidden: true },
            { id: 'status', type: 'text', isHidden: true },
            { id: 'remark', type: 'text', isHidden: true },
            { id: 'amount', type: 'text', isHidden: true },
            { id: 'remainingAmount', type: 'text', isHidden: true }
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})