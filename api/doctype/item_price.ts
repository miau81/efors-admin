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
            { id: 'itemPriceListId', type: 'text', label: '{"en":"Item Price List ID"}', isHidden: true, sectionId: 'sectionDetails', isReadOnly: true, parentField: "item_price_list" },
            {
                id: 'itemId', type: 'link', showInTable: true, showInForm: true,
                options: "item", linkOptions: { valueField: "id", labelField: "name" },
                mandatory: true, label: '{"en":"Item"}', sectionId: 'sectionDetails'
            },
            { id: 'price', type: 'currency', mandatory: true, label: '{"en":"Price"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            // { id: 'validFrom', type: 'datetime', label: '{"en":"Valid From"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            // { id: 'validTo', type: 'datetime', label: '{"en":"Valid To"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})