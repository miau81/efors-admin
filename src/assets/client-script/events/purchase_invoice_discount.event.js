export async function onChange(data) {
    const changes = data.change;
    const changeKeys = Object.keys(changes);
    const existFormValue = data.formValue;
    const existsParentFormValue = data.parentFormValue;
    const formValue = {};
    const parentFormValue = {};
    const componentOptions = {};

    if (changeKeys.includes("discountBy") || changeKeys.includes("rate")) {
        let amount = 0;
        switch (existFormValue['discountBy']) {
            case "PERCENTAGE":
                amount = Number(existsParentFormValue['subtotal'] || 0) * Number(existFormValue['rate'] || 0) / 100;
                amount = Math.round(amount * 100) / 100;
                break;
            case "AMOUNT":
                amount = Number(existFormValue['rate'] || 0);
                break;
            default:
                amount = 0;
        }
        amount = (amount || 0) * -1;
        formValue['amount'] = amount.toFixed(2);
        if (existsParentFormValue) {
            const totalDiscounts = existsParentFormValue['discounts'].reduce((a, b) => a + (b.amount || 0), 0) - (existFormValue['amount'] || 0) + amount;
            parentFormValue['totalDiscounts'] = (Math.floor(totalDiscounts * 100) / 100).toFixed(2);
        }
    }
    const response = {
        formValue: formValue,
        componentOptions: componentOptions,
        parentFormValue: parentFormValue
    }
    return response;
}