import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "customer_payment_relationship",
        label: '{"en":"Customer Payment Relationship"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        isChildTable: true,
        sections: [],
        fields: [
            { id: 'receivingVoicherId', type: 'text', isHidden: true },
            { id: 'salesInvoiceId', type: 'text', isHidden: true },
            { id: 'paidAmount', type: 'currency', isHidden: true },
            { id: 'postingDate', type: 'datetime', isHidden: true }
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})