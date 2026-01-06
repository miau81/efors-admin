import { MyFormComponent } from "@myerp/components";
import { DocType } from "./doctype";
import { Injectable } from "@angular/core";

@Injectable()
export class SalesInvoice extends DocType {

    constructor() {
        super();
    }

    override docType: string = "sales_invoice";

   override async onFormChange(change: any, existFormValue: any, existsParentFormValue?: any, isInit?: boolean, index?: number) :Promise<any> {
        const changeKeys = Object.keys(change);
        const formValue: any = {};
        const parentFormValue: any = {};
        const componentOptions = {};



    const roundTo5Cent = (total:number) => {
        return Math.round(total * 20) / 20;
    }

    const calculateTotalAndRounding = () => {

        const total = Number(formValue['subtotal'] || 0) + Number(existFormValue['totalTaxes'] || 0) + Number(formValue['totalDiscounts'] || 0);
        const grandTotal = roundTo5Cent(total);
        const roundingAmount = Math.round(Number(grandTotal - total) * 100) / 100;
        formValue['grandTotal'] = grandTotal.toFixed(2);
        formValue['roundingAmount'] = roundingAmount.toFixed(2);

    }

    const calculateTotalTaxes = () => {
        const totalTaxes = (existFormValue['taxes'] || []).reduce((a:any, b:any) => Number(a) + Number(b.amount || 0), 0);
        formValue['totalTaxes'] = totalTaxes.toFixed(2);
    }

    const calculateTotalDiscount = () => {
        const discounts = (existFormValue['discounts'] || []).reduce((a:any, b:any) => Number(a) + Number(b.amount || 0), 0);
        formValue['totalDiscounts'] = discounts.toFixed(2);
    }



    if (changeKeys.includes("discounts")) {
        console.group("===============","discount")
        const subtotal = (existFormValue['items'] || []).reduce((a:any, b:any) => Number(a) + Number(b.amountExcTax || 0), 0);
        formValue['subtotal'] = subtotal.toFixed(2);
        // existFormValue['taxes'] = existFormValue['taxes']?.map((t:any) => {
        //     let amount = 0;
        //     switch (t['chargeBy']) {
        //         case "PERCENTAGE":
        //             amount = Number(subtotal || 0) * Number(t['rate'] || 0) / 100;
        //             amount = Math.round(amount * 100) / 100;
        //             break;
        //         case "AMOUNT":
        //             amount = Number(t['rate'] || 0);
        //             break;
        //         default:
        //             amount = 0;
        //     }
        //     return {
        //         ...t,
        //         amount: amount.toFixed(2)
        //     }
        // })

        // formValue['taxes'] = existFormValue['taxes'];

        existFormValue['discounts'] = existFormValue['discounts']?.map((d:any) => {
            let amount = 0;
            switch (d['discountBy']) {
                case "PERCENTAGE":
                    amount = Number(subtotal || 0) * Number(d['rate'] || 0) / 100;
                    amount = Math.round(amount * 100) / 100;
                    break;
                case "AMOUNT":
                    amount = Number(d['rate'] || 0);
                    break;
                default:
                    amount = 0;
            }
            return {
                ...d,
                amount: (amount * -1).toFixed(2)
            }
        })

        formValue['discounts'] = existFormValue['discounts'];
        // calculateTotalTaxes();
        calculateTotalDiscount();
        calculateTotalAndRounding();
    }

    if(changeKeys.includes("items") ){
         const amountExcTax = (existFormValue['items'] || []).reduce((a:any, b:any) => Number(a) + Number(b.amountExcTax || 0), 0);
         const taxAmount = (existFormValue['items'] || []).reduce((a:any, b:any) => Number(a) + Number(b.taxAmount || 0), 0);
        formValue['subtotal'] = amountExcTax.toFixed(2);
        formValue['totalTaxes'] = taxAmount.toFixed(2);
    }





    const response = {
        formValue: formValue,
        componentOptions: componentOptions,
        parentFormValue: parentFormValue
    }
    return response;
    }

    
    override async onLoad(): Promise<void> {
        if (this.parent.isNew) {
            this.parent.actionButtons = [];
        }
        return;
    }
}

