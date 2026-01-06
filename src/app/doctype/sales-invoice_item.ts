import { MyFormComponent } from "@myerp/components";
import { DocType } from "./doctype";
import { Injectable } from "@angular/core";

@Injectable()
export class SalesInvoiceItem extends DocType {

    constructor() {
        super();
    }

    override docType: string = "sales_invoice_item";


    override async onFormChange(change: any, existFormValue: any, existsParentFormValue?: any, isInit?: boolean, index?: number): Promise<any> {
        const changeKeys = Object.keys(change);
        const formValue: any = {};
        const parentFormValue: any = {};
        const componentOptions = {};

        const roundTo5Cent = (total: number) => {
            return Math.round(total * 20) / 20;
        }

        const calculateTotalAndRounding = () => {
            const total = Number(parentFormValue['subtotal'] || 0) + Number(parentFormValue['totalTaxes'] || 0) + Number(existsParentFormValue['totalDiscounts'] || 0);
            const grandTotal = roundTo5Cent(total);
            const roundingAmount = Math.round(Number(grandTotal - total) * 100) / 100;
            parentFormValue['grandTotal'] = grandTotal.toFixed(2);
            parentFormValue['roundingAmount'] = roundingAmount.toFixed(2);

        }


        if (changeKeys.includes("quantity") || changeKeys.includes("unitPrice")) {
            const amountExcTax = (existFormValue['quantity'] || 0) * (existFormValue['unitPrice'] || 0);

            const taxAmount = await calculateItemTax(existFormValue['taxChargeBy'], existFormValue['taxRate'], amountExcTax);
            const totalAmount = amountExcTax + taxAmount;

            if (existsParentFormValue) {
                const subtotal = existsParentFormValue['items'].reduce((a: any, b: any) => Number(a) + Number(b.amountExcTax || 0), 0) - Number(existFormValue['amountExcTax'] || 0) + Number(amountExcTax);
                const totalTaxes = existsParentFormValue['items'].reduce((a: any, b: any) => Number(a) + Number(b.taxAmount || 0), 0) - Number(existFormValue['taxAmount'] || 0) + Number(taxAmount);
                parentFormValue['subtotal'] = subtotal;
                parentFormValue['totalTaxes'] = totalTaxes;
                calculateTotalAndRounding();

            }
            formValue['taxAmount'] = taxAmount.toFixed(2);
            formValue['totalAmount'] = totalAmount.toFixed(2);
            formValue['amountExcTax'] = amountExcTax.toFixed(2);
        }
        const response = {
            formValue: formValue,
            componentOptions: componentOptions,
            parentFormValue: parentFormValue
        }
        return response;
    }

}

async function calculateItemTax(taxCharge: string, taxRate: number, valueToCalculate: number) {
    switch (taxCharge) {
        case "PERCENTAGE":
            return Math.round(((taxRate || 0) / 100 * valueToCalculate) * 100) / 100;
        case "AMOUNT":
            return taxRate;
        default:
            return 0;
    }
}

