import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "uom",
        label: '{"en":"UOM"}',
        namingType: "field",
        namingFormat: "code",
        searchFields: ["code", "name"],
        fields: [
            { id: 'code', type: 'text', showInForm: true, showInTable: true, mandatory: true, isNotEditable: true, label: '{"en":"Code"}' },
            { id: 'name', type: 'text', showInForm: true, showInTable: true, formComponentType: "text", isTranslatable: true, mandatory: true, label: '{"en":"Name"}' },
            { id: 'isWholeNumber', type: 'boolean', showInForm: true, showInTable: true,  isTranslatable: true, mandatory: true, label: '{"en":"Whole Number"}' },
            { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})