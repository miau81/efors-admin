export async function onChange(data) {
    const changes = data.change;
    const changeKeys = Object.keys(changes);
    const existFormValue = data.formValue;
    const existsParentFormValue = data.parentFormValue;
    const formValue = {};
    const parentFormValue = {};
    const componentOptions = {};

    if (changeKeys.includes("quantity") || changeKeys.includes("unitPrice")) {
        formValue['amount'] = (existFormValue['quantity'] || 0) * (existFormValue['unitPrice'] || 0);
        if (existsParentFormValue) {
            const subtotal = existsParentFormValue['items'].reduce((a, b) => Number(a) + Number(b.amount || 0), 0) - Number(existFormValue['amount'] || 0) + Number(formValue['amount']);
            parentFormValue['subtotal'] = subtotal;
        }
    }
    const response = {
        formValue: formValue,
        componentOptions: componentOptions,
        parentFormValue: parentFormValue
    }
    return response;
}