export async function onChange(data) {
    const changes = data.change;
    const changeKeys = Object.keys(changes);
    const existFormValue = data.formValue;
    const existsParentFormValue = data.parentFormValue;
    const formValue = {};
    const parentFormValue = {};
    const componentOptions = {};

    const roundTo5Cent = (total) => {
        return Math.round(total * 20) / 20;
    }

    const calculateTotalAndRounding = () => {
        console.log("s", formValue['subtotal'], formValue['totalTaxes'], formValue['totalDiscounts'])

        const total = Number(formValue['subtotal'] || 0) + Number(formValue['totalTaxes'] || 0) + Number(formValue['totalDiscounts'] || 0);
        const grandTotal = roundTo5Cent(total);
        const roundingAmount = Math.round(Number(grandTotal - total) * 100) / 100;
        formValue['grandTotal'] = grandTotal.toFixed(2);
        formValue['roundingAmount'] = roundingAmount.toFixed(2);

    }

    const calculateTotalTaxes = () => {
        const totalTaxes = (existFormValue['taxes'] || []).reduce((a, b) => Number(a) + Number(b.amount || 0), 0);
        formValue['totalTaxes'] = totalTaxes.toFixed(2);
    }

    const calculateTotalDiscount = () => {
        const discounts = (existFormValue['discounts'] || []).reduce((a, b) => Number(a) + Number(b.amount || 0), 0);
        formValue['totalDiscounts'] = discounts.toFixed(2);
    }



    if (changeKeys.includes("items") || changeKeys.includes("taxes") || changeKeys.includes("discounts")) {
        const subtotal = (existFormValue['items'] || []).reduce((a, b) => Number(a) + Number(b.amount || 0), 0);
        formValue['subtotal'] = subtotal.toFixed(2);
        existFormValue['taxes'] = existFormValue['taxes']?.map(t => {
            let amount = 0;
            switch (t['chargeBy']) {
                case "PERCENTAGE":
                    amount = Number(subtotal || 0) * Number(t['rate'] || 0) / 100;
                    amount = Math.round(amount * 100) / 100;
                    break;
                case "AMOUNT":
                    amount = Number(t['rate'] || 0);
                    break;
                default:
                    amount = 0;
            }
            return {
                ...t,
                amount: amount.toFixed(2)
            }
        })

        formValue['taxes'] = existFormValue['taxes'];

        existFormValue['discounts'] = existFormValue['discounts']?.map(d => {
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
        calculateTotalTaxes();
        calculateTotalDiscount();
        calculateTotalAndRounding();
    }


    const response = {
        formValue: formValue,
        componentOptions: componentOptions,
        parentFormValue: parentFormValue
    }

    console.log(response)
    return response;
}

