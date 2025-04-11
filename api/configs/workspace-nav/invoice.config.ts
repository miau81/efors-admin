import { MyErpWorkSpaceNav } from "../../../src/app/@interfaces/interface"

export const config: MyErpWorkSpaceNav[] = [
    {
        id: 'invoice',
        label: 'Invoice',
        sorting: 1,
        children: [
            {
                id: 'customer',
                label: 'Customer',
                isSingle: false,
                link: '/doc/customer',
                sorting: 1,
            },
            {
                id: 'invoice',
                label: 'Invoice',
                isSingle: false,
                link: '/doc/invoice',
                sorting: 2
            },
            {
                id: 'statement',
                label: 'Statement',
                isSingle: false,
                link: '/doc/statement',
                sorting: 3
            }
        ]
    }
]


