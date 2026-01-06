import { AccountTransaction, TransactionUtilService } from "./trnx_util.event";
import { SRequest } from "../../src/api/interfaces/api.route.interface";
import dayjs from "dayjs";
import { core } from "../../src/api/core/core";

const tranxUtil = new TransactionUtilService();

export async function onChange(document: string, req: SRequest) {

    const changes = req.body.change;
    const existFormValue = req.body.formValue;
    // const existsParentFormValue = req.body.parentFormValue;
    const changeKeys = Object.keys(changes);
    const formValue: any = {};
    const parentFormValue: any = {};
    const componentOptions: any = {};
    const items = existFormValue["items"] || [];
    if (changeKeys.includes("itemId") && changes.itemId) {

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

        const item = await core.getDocument(req, "item", changes.itemId);
        // let salesItem = existFormValue["items"]?.find((i: any) => i.itemId == item.id && i.unitPrice == item.unitPrice);
        const amountExcTax = item.unitPrice || 0;
        let tax;
        if (!item.nonTaxable && item.taxId) {
            tax = await core.getDocument(req, "selling_tax", item.taxId);
        }
        const taxAmount = await calculateItemTax(tax, amountExcTax);

        const newItem = {
            itemId: item.id,
            name: item.name,
            quantity: 1,
            uom: item.uom,
            unitPrice: item.unitPrice || 0,
            amountExcTax: amountExcTax,
            taxAmount: taxAmount,
            totalAmount: amountExcTax + taxAmount,
            taxClass: item.taxId,
            taxRate: tax?.rate,
            taxChargeBy: tax?.chargeBy
        }

        items.push(newItem);

        // const items = existFormValue["items"];
        const subtotal = Number(existFormValue["subtotal"]) + amountExcTax;
        const totalTaxes = Number(existFormValue["totalTaxes"]) + taxAmount;
        formValue["items"] = items;
        formValue['subtotal'] = subtotal.toFixed(2);
        formValue['totalTaxes'] = totalTaxes.toFixed(2);
        calculateTotalAndRounding();



        // formValue["uom"] = item.uom;
        // formValue["unitPrice"] = item.unitPrice || 0;
        // formValue['amount'] = item.unitPrice * existFormValue['quantity'];
    }

    // formValue[]

    const response: any = {
        formValue: formValue,
        tableValue: formValue,
        componentOptions: componentOptions,
        parentFormValue: parentFormValue
    }
    return response;
}

export async function onPrint(data: string, req: SRequest) {
    const body = req.body.data;
    console.log(body)
    // const data = await globalService.getSingleDocument({ ...params }, `WHERE id='${body.id}'`, mysqlConn);
    return body;
}

export async function afterSubmit(data: any, previousData: any, req: SRequest) {
    if (previousData.docStatus != 'DRAFT') {
        return data;
    }
    // Debit Customer Account Transaction
    const trnx: AccountTransaction = {
        partyId: previousData.customerId,
        accountId: "",
        transactionType: 'DEBIT',
        description: `Sales Invoice: ${previousData.id}`,
        refDoc: "Sales Invoice",
        refNo: previousData.id,
        amount: previousData.grandTotal,
        postingDate: previousData.postingDate,
        companyId: req.com
    }
    await tranxUtil.insertAcctTranx("CUSTOMER", trnx);
    return data;
}

export async function afterCancel(data: any, previousData: any, req: SRequest) {
    if (previousData?.docStatus != 'SUBMIT') {
        return data;
    }
    // Credit Customer Account Transaction
    const trnx: AccountTransaction = {
        partyId: previousData.customerId,
        accountId: '',
        transactionType: 'CREDIT',
        description: `Cancel of Sales Invoice: ${previousData.id}`,
        refDoc: "Sales Invoice",
        refNo: data.id,
        amount: previousData.grandTotal,
        postingDate: dayjs().format("YYYY-MM-DD HH:mm:ss")
    }
    await tranxUtil.insertAcctTranx("CUSTOMER", trnx);
    if (previousData?.paymentStatus == 'UNPAID') {
        return data;
    }
    return data;
    //TODO  overpaid
}


async function calculateItemTax(tax: any, valueToCalculate: number) {
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