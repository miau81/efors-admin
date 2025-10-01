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
                id: 'item_uom',
                label: 'Item UOM',
                isSingle: false,
                link: '/doc/item_uom',
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
                label: 'Tax and Charges',
                isSingle: false,
                link: '/doc/tax',
                sorting: 1,
            }           
        ]
    }
]


