
import { DocTypeEvent } from "./core/doctype.event";

export default class SalesInvoiceChargeDiscount extends DocTypeEvent {
	constructor() {
		super();
	}

	override docType: string = "sales_invoice_charge_discount";

	override async onFormChange(change: any, existFormValue: any, existsParentFormValue?: any, isInit?: boolean, index?: number): Promise<any> {

		const changeKey = Object.keys(change)[0];
		const formValue: any = {};
		const parentFormValue: any = {};
		const componentOptions = {};

		const positiveOrNegative = (type: string, value: number) => {
			if (!type) {
				return value;
			}
			return type == "CHARGE" ? Math.abs(value) : -Math.abs(value);
		}

		const subtotal = (existsParentFormValue['subtotal'] || 0)
		const type = existFormValue['type'];

		switch (changeKey) {
			case "rate":
			case "amount":
				if (changeKey != 'amount') {
					const amount = Math.round((Math.abs(existFormValue['rate'] || 0) / 100 * subtotal) * 100) / 100;
					formValue['amount'] = positiveOrNegative(type, amount).toFixed(2);
					const positiveDiscountRate = Math.abs(existFormValue['rate'] || 0);
					formValue['rate'] = positiveDiscountRate.toFixed(2);

				} else {
					const rate = Math.round(((Math.abs(existFormValue['amount'] || 0)) / subtotal) * 100)
					formValue['rate'] = rate.toFixed(2);
					const finalAmount = - Math.abs(existFormValue['amount'] || 0);
					formValue['amount'] = positiveOrNegative(type, finalAmount).toFixed(2);

				}
				// calculateAmounts(subtotal);
				break;
			case "type":
				formValue['amount'] = positiveOrNegative(type, existFormValue["amount"]).toFixed(2);
				break;
		}
		const response = {
			formValue: formValue,
			componentOptions: componentOptions,
			parentFormValue: parentFormValue
		}
		return response;
	}
}
