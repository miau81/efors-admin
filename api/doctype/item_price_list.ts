import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "item_price_list",
        label: '{"en":"Item Price List"}',
        namingType: "field",
        namingFormat: "code",
        searchFields: [],
        sections: [{ id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1 }],
        fields: [{
            id: 'type', type: 'text', formComponentType: "select", showInTable: true, showInForm: true,
            isNotEditable: true,
            options: [
                { value: "SELLING", label: '{"en":"Selling Price"}' },
                { value: "PURCHASINGE", label: '{"en":"Purchasing Price"}' }
            ],
            defaultValue: "SELLING",
            mandatory: true, label: '{"en":"Type"}', sectionId: 'sectionDetails'
        },
        { id: 'code', type: 'text', showInForm: true, showInTable: true, mandatory: true, isNotEditable: true, label: '{"en":"Code"}', sectionId: 'sectionDetails' },
        { id: 'name', type: 'text', showInForm: true, showInTable: true, isTranslatable: true, mandatory: true, label: '{"en":"Name"}', sectionId: 'sectionDetails' },
        { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})