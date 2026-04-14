import { MyErpWorkSpaceNav } from "../../../src/app/@interfaces/interface"

export const title = "Stock";
export const config: MyErpWorkSpaceNav[] = [
    {
        id: 'item',
        label: 'Item',
        sorting: 1,
        children: [
            {
                id: 'item',
                label: 'Item',
                isSingle: false,
                link: '/doc/item',
                sorting: 1,
            },
            {
                id: 'item_group',
                label: 'Item Group',
                isSingle: false,
                link: '/doc/item_group',
                sorting: 1,
            },
            {
                id: 'item_price_list',
                label: 'Item Price List',
                isSingle: false,
                link: '/doc/item_price_list',
                sorting: 1,
            },
            {
                id: 'uom',
                label: 'UOM',
                isSingle: false,
                link: '/doc/uom',
                sorting: 1,
            },
           
        ]
    },
    {
        id: 'tax',
        label: 'Tax',
        sorting: 1,
        children: [
            {
                id: 'tax',
                label: 'Tax Class',
                isSingle: false,
                link: '/doc/tax_class',
                sorting: 1,
            }           
        ]
    }
]


