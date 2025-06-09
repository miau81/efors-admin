export async function onChange(data) {
    const changes = data.change;
    const changeKeys = Object.keys(changes);
    const existFormValue = data.formValue;
    const existsParentFormValue = data.parentFormValue;
    const formValue = {};
    const parentFormValue = {};
    const componentOptions = {};

    if (changeKeys.includes("chargeBy") || changeKeys.includes("rate")) {
        switch (existFormValue['chargeBy']) {
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
        formValue['amount'] = formValue['amount'] || 0
        if (existsParentFormValue) {
            const totalTaxes = existsParentFormValue['taxes'].reduce((a, b) => a + (b.amount || 0), 0) - (existFormValue['amount'] || 0) + formValue['amount'];
            parentFormValue['totalTaxes'] = Math.floor(totalTaxes * 100) / 100;
        }
    }
    const response = {
        formValue: formValue,
        componentOptions: componentOptions,
        parentFormValue: parentFormValue
    }
    return response;
}