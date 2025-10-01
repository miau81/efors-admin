export async function onChange(data) {
    const changes = data.change;
    const changeKeys = Object.keys(changes);
    const existFormValue = data.formValue;
    const existsParentFormValue = data.parentFormValue;
    const formValue = {};
    const parentFormValue = {};
    const componentOptions = {};

    if (changeKeys.includes("chargeBy") || changeKeys.includes("rate")) {
        let amount = 0;
        switch (existFormValue['chargeBy']) {
            case "PERCENTAGE":
                amount = Number(existsParentFormValue['subtotal'] || 0) * Number(existFormValue['rate'] || 0) / 100;
                amount = Math.round(amount * 100) / 100;
                break;
            case "AMOUNT":
                amount = Number(existFormValue['rate'] || 0);
                break;
            default:
                formValue['amount'] = 0;
        }
        amount = amount || 0;
        formValue['amount'] = amount.toFixed(2);
        if (existsParentFormValue) {
            const totalTaxes = existsParentFormValue['taxes'].reduce((a, b) => a + (b.amount || 0), 0) - (existFormValue['amount'] || 0) + amount;
            parentFormValue['totalTaxes'] = (Math.floor(totalTaxes * 100) / 100).toFixed(2);
        }
    }
    const response = {
        formValue: formValue,
        componentOptions: componentOptions,
        parentFormValue: parentFormValue
    }
    return response;
}