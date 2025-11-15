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
            { id: 'voucherId', type: 'text', isHidden: true },
            { id: 'invoiceId', type: 'text', isHidden: true },
            { id: 'advancPaymentId', type: 'text', isHidden: true },
            { id: 'paidAmount', type: 'currency', isHidden: true },
            { id: 'postingDate', type: 'datetime', isHidden: true },
            { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})