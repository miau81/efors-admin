import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";;

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "bundle_item",
        label: '{"en":"Bundle Item"}',
        namingType: "random",
        fields: [
            { id: 'parentId', isHidden: true, type: 'text', mandatory: true, isNotEditable: true, label: '{"en":"Parent Id"}' },
            {
                id: 'itemId', type: 'link', options: "item", mandatory: true, showInTable: true, showInForm: true,
                linkOptions: { valueField: "id", labelField: "name", filters: [{ field: "type", operator: "=", value: "NORMAL" }] },
                label: '{"en":"Item"}'
            },
            {
                id: 'quantity', type: 'number', showInForm: true, showInTable: true, mandatory: true,
                label: '{"en":"Quantity"}'
            },
            {
                id: 'uom', type: 'link', options: "uom", canAddNew: true, mandatory: true, 
                showInTable: true, showInForm: true,
                linkOptions: { valueField: "id", labelField: "name" },
                label: '{"en":"UOM"}'
            },
            { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})