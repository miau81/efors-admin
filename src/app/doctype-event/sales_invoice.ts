
import { DocTypeEvent } from "./core/doctype.event";
import { calculateListTotal, roundTo5Cent, roundToDecimal } from "@myerp/utils/misc";


export default class SalesInvoice extends DocTypeEvent {

    override docType: string = "sales_invoice";

    override async onFormChange(change: any, existFormValue: any, existsParentFormValue?: any, isInit?: boolean, index?: number): Promise<any> {
        const changeKeys = Object.keys(change);
        const formValue: any = {};
        const parentFormValue: any = {};
        const componentOptions = {};

        const calculateTotalAndRounding = () => {
            const total = Number(existFormValue['subtotal'] || 0) + Number(existFormValue['totalTaxes'] || 0) + Number(formValue['totalCharges'] || 0) + Number(formValue['totalDiscounts'] || 0);
            const grandTotal = roundTo5Cent(total);
            const roundingAmount = roundToDecimal(Number(grandTotal - total));
            formValue['grandTotal'] = grandTotal.toFixed(2);
            formValue['roundingAmount'] = roundingAmount.toFixed(2);

        }

        const positiveOrNegative = (type: string, value: number) => {
            if (!type) {
                return value;
            }
            return type == "CHARGE" ? Math.abs(value) : -Math.abs(value);
        }

        const recalculateChargesAndDiscount = () => {
            const list = (existFormValue['chargeAndDiscount'] || []).map((l: any) => {
                const amount = positiveOrNegative(l.type, Math.abs(roundToDecimal((existFormValue['subtotal'] || 0) * l.rate)))
                return {
                    ...l,
                    amount: amount
                }
            })
            existFormValue['chargeAndDiscount'] = list;
            formValue['chargeAndDiscount'] = list;
            calculateChargesDiscountTotal();
        }

        const calculateChargesDiscountTotal = () => {
            const discountList = (existFormValue['chargeAndDiscount'] || []).filter((l: any) => l.type == "DISCOUNT");
            const chargesList = (existFormValue['chargeAndDiscount'] || []).filter((l: any) => l.type == "CHARGE");
            const totalCharges = calculateListTotal(chargesList, "amount");
            const totalDiscounts = calculateListTotal(discountList, "amount");
            existFormValue['totalCharges'] = totalCharges;
            existFormValue['totalDiscounts'] = totalDiscounts;
            formValue['totalCharges'] = totalCharges.toFixed(2);
            formValue['totalDiscounts'] = totalDiscounts.toFixed(2);
        }

        if (changeKeys.includes("chargeAndDiscount")) {
            calculateChargesDiscountTotal();
            calculateTotalAndRounding();
        }

        if (changeKeys.includes("items")) {
            const amountExcTax = calculateListTotal(existFormValue['items'], "amountExcTax");
            const taxAmount = calculateListTotal(existFormValue['items'], "taxAmount");
            existFormValue['subtotal'] = amountExcTax;
            existFormValue['totalTaxes'] = taxAmount;
            formValue['subtotal'] = amountExcTax.toFixed(2);
            formValue['totalTaxes'] = taxAmount.toFixed(2);
            recalculateChargesAndDiscount();
            calculateTotalAndRounding();
        }

        if (changeKeys.includes("itemId") && change.itemId) {
            const items = existFormValue["items"] || [];
            const roundTo5Cent = (total: number) => {
                return Math.round(total * 20) / 20;
            }

            const calculateTotalAndRounding = () => {
                const total = Number(formValue['subtotal'] || 0) + Number(formValue['totalTaxes'] || 0) + Number(existFormValue['totalDiscounts'] || 0);
                const grandTotal = roundTo5Cent(total);
                const roundingAmount = Math.round(Number(grandTotal - total) * 100) / 100;
                formValue['grandTotal'] = grandTotal.toFixed(2);
                formValue['roundingAmount'] = roundingAmount.toFixed(2);

            }

            const calculateItemTax = (tax: any, valueToCalculate: number) => {
                if (!tax) {
                    return 0;
                }
                switch (tax.chargeBy) {
                    case "PERCENTAGE":
                        return Math.round((tax.rate / 100 * valueToCalculate) * 100) / 100;
                    case "AMOUNT":
                        return tax.rate;
                }
            }

            const item: any = await this.parent.api.getDocument("item", change.itemId);
            const amountExcTax = item.unitPrice || 0;
            let tax: any;
            if (!item.nonTaxable && item.taxId) {
                tax = await await this.parent.api.getDocument("selling_tax", item.taxId);
            }
            const taxAmount = await calculateItemTax(tax, amountExcTax);

            const newItem = {
                itemId: item.id,
                name: item.name,
                quantity: 1,
                uom: item.uom,
                unitPrice: item.unitPrice || 0,
                amountExcTax: amountExcTax,
                discountRate: 0,
                discount: 0,
                taxAmount: taxAmount,
                totalAmount: amountExcTax + taxAmount,
                taxClass: item.taxId,
                taxRate: tax?.rate || 0,
                taxChargeBy: tax?.chargeBy
            }

            items.push(newItem);

            // const items = existFormValue["items"];
            const subtotal = items.reduce((a: any, b: any) => Number(a) + Number(b.amountExcTax || 0), 0);
            const totalTaxes = items.reduce((a: any, b: any) => Number(a) + Number(b.taxAmount || 0), 0);
            formValue["items"] = items;
            formValue['subtotal'] = subtotal.toFixed(2);
            formValue['totalTaxes'] = totalTaxes.toFixed(2);
            formValue['itemId'] = '';
            calculateTotalAndRounding();
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
        } else {
            console.log("is not new")
            this.parent.actionButtons = [
                {
                    code: "SUBMIT_EINVOICE", label: '{"en":"Submit E-Invoice"}',
                    onClick: () => {
                        console.log(1)
                    }
                },
                { code: "CANCEL_EINVOICE", label: '{"en":"Cancel E-Invoice"}' },
                { code: "SUBMIT_EINVOICE_SANDBOX", label: '{"en":"Submit E-Invoice (Testing Server)"}' },
                { code: "CANCEL_EINVOICE_SANDBOX", label: '{"en":"Cancel E-Invoice (Testing Server)"}' },

            ]
        }
        return;
    }

    

}



