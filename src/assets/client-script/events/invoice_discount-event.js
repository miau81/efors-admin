export async function onChange(data) {
    const changes = data.change;
    const changeKeys = Object.keys(changes);
    const existFormValue = data.formValue;
    const existsParentFormValue = data.parentFormValue;
    const formValue = {};
    const parentFormValue = {};
    const componentOptions = {};

    if (changeKeys.includes("discountBy") || changeKeys.includes("rate")) {
        switch (existFormValue['discountBy']) {
            case "PERCENTAGE":
                const amount = Number(existsParentFormValue['subtotal'] || 0) * Number(existFormValue['rate'] || 0) / 100;
                formValue['amount'] = Math.round(amount * 100) / 100;
                break;
            case "AMOUNT":
                formValue['amount'] = Number(existFormValue['rate'] || 0);
                break;
            default:
                formValue['amount'] = 0;
        }
        formValue['amount'] = (formValue['amount'] || 0) * -1;
        if (existsParentFormValue) {
            const totalDiscounts = existsParentFormValue['discounts'].reduce((a, b) => a + (b.amount || 0), 0) - (existFormValue['amount'] || 0) + formValue['amount'];
            parentFormValue['totalDiscounts'] = Math.floor(totalDiscounts * 100) / 100;
        }
    }
    const response = {
        formValue: formValue,
        componentOptions: componentOptions,
        parentFormValue: parentFormValue
    }
    return response;
}