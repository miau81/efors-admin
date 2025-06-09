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
        console.log("s",formValue['subtotal'],formValue['totalTaxes'],formValue['totalDiscounts'])

        const total = Number(formValue['subtotal'] || 0) + Number(formValue['totalTaxes'] || 0) + (formValue['totalDiscounts'] || 0);
        formValue['grandTotal'] = roundTo5Cent(total);
        formValue['roundingAmount'] = Math.round(Number(formValue['grandTotal'] - total) * 100) / 100;
    }

    const calculateTotalTaxes = () => {
        const totalTaxes = (existFormValue['taxes'] || []).reduce((a, b) => Number(a) + Number(b.amount || 0), 0);
        formValue['totalTaxes'] = totalTaxes;
    }

    const calculateTotalDiscount = () => {
        const discounts = (existFormValue['discounts'] || []).reduce((a, b) => Number(a) + Number(b.amount || 0), 0);
        formValue['totalDiscounts'] = discounts;
    }



    if (changeKeys.includes("items")) {
        const subtotal = (existFormValue['items'] || []).reduce((a, b) => Number(a) + Number(b.amount || 0), 0);
        formValue['subtotal'] = subtotal;
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
                amount: amount
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
                amount: amount * -1
            }
        })

        formValue['discounts'] = existFormValue['discounts'];
        calculateTotalTaxes();
        calculateTotalDiscount();
        calculateTotalAndRounding();
    }

    if (changeKeys.includes("taxes")) {
        calculateTotalTaxes();
        calculateTotalAndRounding();
    }

    if (changeKeys.includes("discounts")) {
        calculateTotalDiscount();
        calculateTotalAndRounding();
    }

    // if (changeKeys.includes("subtotal") || changeKeys.includes("totalTaxes")
    //     || changeKeys.includes("totalCharges") || changeKeys.includes("totalDiscounts")) {

    //     console.log(existFormValue)
    //     const total = Number(existFormValue['subtotal'] || 0) + Number(existFormValue['totalTaxes'] || 0) + Number(existFormValue['totalCharges'] || 0) - (existFormValue['totalDiscounts'] || 0);
    //     formValue['grandTotal'] = roundTo5Cent(total);
    //     formValue['roundingAmount'] =Math.round( Number(formValue['grandTotal'] - total) *100)/100;
    // }
    const response = {
        formValue: formValue,
        componentOptions: componentOptions,
        parentFormValue: parentFormValue
    }

    console.log(response)
    return response;
}

