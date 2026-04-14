import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "item_barcode",
        label: '{"en":"Item Barcode"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        isChildTable: true,
        sections: [],
        fields: [
            { id: 'itemId', type: 'text', isHidden: true, options: "item", mandatory: true, label: '{"en":"Item"}' },
            {
                id: 'barcode', isUnique: true, uniqueBy: ["itemId"], type: 'text', mandatory: true, label: '{"en":"Barcode"}',
                showInTable: true, showInForm: true, formColumnSize: "col-md-8"
            },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})