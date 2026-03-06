

import { DocTypeEvent } from "./core/doctype.event";
import { roundToDecimal } from "@myerp/utils/misc";


export default class SalesInvoiceItem extends DocTypeEvent {

    constructor() {
        super();
    }

    override docType: string = "sales_invoice_item";


    override async onFormChange(change: any, existFormValue: any, existsParentFormValue?: any, isInit?: boolean, index?: number): Promise<any> {
        const changeKey = Object.keys(change)[0];
        const formValue: any = {};
        const parentFormValue: any = {};
        const componentOptions = {};

        const calculateAmounts = (subtotal: number) => {
            const amountExcTax = calculateExcTax(subtotal, existFormValue['discount']);
            const taxAmount = calculateItemTax(existFormValue['taxChargeBy'], existFormValue['taxRate'], amountExcTax);
            const totalAmount = amountExcTax + taxAmount;

            formValue['taxAmount'] = taxAmount.toFixed(2);
            formValue['totalAmount'] = totalAmount.toFixed(2);
            formValue['amountExcTax'] = amountExcTax.toFixed(2);
        }

        const calculateExcTax = (subtotal: number, discount: number) => {
            return subtotal - Math.abs((discount || 0));
        }

        const calculateItemTax = (taxCharge: string, taxRate: number, valueToCalculate: number) => {
            switch (taxCharge) {
                case "PERCENTAGE":
                    return roundToDecimal((taxRate || 0) / 100 * valueToCalculate) ;
                case "AMOUNT":
                    return taxRate;
                default:
                    return 0;
            }
        }

        switch (changeKey) {
            case "quantity":
            case "unitPrice":
            case "discount":
            case "discountRate":
                const subtotal = roundToDecimal(existFormValue['quantity']) * roundToDecimal(existFormValue['unitPrice']);
                if (changeKey != 'discount') {
                    const positiveDiscountRate = roundToDecimal(Math.abs(existFormValue['discountRate'] || 0));
                    const discount = - roundToDecimal(positiveDiscountRate / 100 * subtotal)
                    formValue['discount'] = discount.toFixed(2);
                    existFormValue['discount'] = discount;
                    formValue['discountRate'] = positiveDiscountRate.toFixed(2);

                } else {
                    const positiveDiscount = Math.abs(existFormValue['discount'] || 0)
                    const discountRate = roundToDecimal((positiveDiscount / subtotal) * 100);
                    formValue['discountRate'] = discountRate.toFixed(2);
                    const negativeDiscount = -positiveDiscount;
                    formValue['discount'] = negativeDiscount.toFixed(2);

                }
                calculateAmounts(subtotal);
                break;
        }

        const response = {
            formValue: formValue,
            componentOptions: componentOptions,
            parentFormValue: parentFormValue
        }
        console.log(response)
        return response;
    }

}












