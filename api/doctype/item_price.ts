import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "item_price",
        label: '{"en":"Item Price"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        isChildTable: true,
        sections: [{ id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1 }],
        fields: [
            { id: 'itemId', type: 'text', label: '{"en":"Item ID"}', isHidden: true, sectionId: 'sectionDetails', isReadOnly: true, parentField: "id" },
            { id: 'break_1', type: 'breakline', showInForm: true, sectionId: 'sectionDetails' },
            {
                id: 'type', type: 'text', formComponentType: "select", showInTable: true, showInForm: true,
                options: [
                    { value: "STANDARD_SELLING", label: '{"en":"Standard Selling"}' }
                ],
                defaultValue: "STANDARD_SELLING",
                mandatory: true, label: '{"en":"Type"}', sectionId: 'sectionDetails'
            },
            { id: 'price', type: 'number', mandatory: true, label: '{"en":"Price"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'validFrom', type: 'datetime', label: '{"en":"Valid From"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'validTo', type: 'datetime', label: '{"en":"Valid To"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },

        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})