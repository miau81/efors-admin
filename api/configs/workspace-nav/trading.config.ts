import { MyErpWorkSpaceNav } from "../../../src/app/@interfaces/interface"

export const title = "Trading";

export const config: MyErpWorkSpaceNav[] = [
    {
        id: 'selling',
        label: 'Selling',
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
                id: 'sales_invoice',
                label: 'Sales Invoice',
                isSingle: false,
                link: '/doc/sales_invoice',
                sorting: 2
            },
        ]
    },
    {
        id: 'tax',
        label: 'Taxes',
        sorting: 1,
        children: [
            {
                id: 'selling_tax',
                label: 'Selling Tax and Charges',
                isSingle: false,
                link: '/doc/selling_tax',
                sorting: 1,
            },
            {
                id: 'supplier_tax',
                label: 'Supplier Tax and Charges',
                isSingle: false,
                link: '/doc/supplier_tax',
                sorting: 1,
            }
        ]
    },
    {
        id: 'purchasing',
        label: 'Purchasing',
        sorting: 1,
        children: [
            {
                id: 'supplier',
                label: 'Supplier',
                isSingle: false,
                link: '/doc/supplier',
                sorting: 1,
            },
            {
                id: 'purchase_invoice',
                label: 'Purchase Invoice',
                isSingle: false,
                link: '/doc/purchase_invoice',
                sorting: 2
            },
        ]
    },
    {
        id: 'voucher',
        label: 'Note and Voucher',
        sorting: 1,
        children: [
            {
                id: 'receiving_voucher',
                label: 'Receiving Voucher',
                isSingle: false,
                link: '/doc/receiving_voucher',
                sorting: 3
            },
            {
                id: 'payment_voucher',
                label: 'Payment Voucher',
                isSingle: false,
                link: '/doc/payment_voucher',
                sorting: 3
            },
            {
                id: 'debit_note',
                label: 'Debit Note',
                isSingle: false,
                link: '/doc/debit_note',
                sorting: 3
            },
            {
                id: 'credit_note',
                label: 'Credit Note',
                isSingle: false,
                link: '/doc/credit_note',
                sorting: 3
            }

        ]
    }
]


