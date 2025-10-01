import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "item_uom",
        label: '{"en":"Item UOM"}',
        namingType: "byField",
        namingFormat: "code",
        searchFields: ["code", "name"],
        fields: [
        { id: 'code', type: 'text', showInForm: true, showInTable: true, mandatory: true, isNotEditable: true, label: '{"en":"Code"}' },
        { id: 'name', type: 'text', showInForm: true, showInTable: true, formComponentType: "text", isTranslatable: true, mandatory: true, label: '{"en":"Name"}' },
        { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})