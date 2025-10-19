import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiParam, ApiSaveParam } from "../../src/api/interfaces/api.main.interface";
import { ConvertUtil } from "../../src/api/utils/convert";
import { ApiGlobalService } from "../../src/api/services/api.global.service";
import { ApiRequestMethod } from "../../src/api/interfaces/api.enum";

const globalService = new ApiGlobalService();

export async function afterSubmit(data: any, params: ApiParam, mysqlConn: ConnectionAction, previousData?: any) {
    if (previousData.docStatus != 'DRAFT') {
        return data;
    }

    const invs = data.payForInvoice || [];
    const payforInvoice = invs.length > 0 ? `\nPay for:${invs.map((i: any) => i.salesInvoice).toString()}` : '';
    for (const p of data.paymentMethods) {
        const trans = {
            partyId: data.customer,
            partyType: "CUSTOMER",
            description: `Payment received`,
            remark: `${data.remark}${payforInvoice}`,
            transactionType: "DEBIT",
            amount: p.amount,
            account: p.paymentMethod,
            refNo: previousData.id,
            refDate: data.postingDate,
            referenceDoc: "Receiving Voucher"
        }
        const saveParams: ApiSaveParam = {
            ...params,
            tableName: "account_transaction",
            body: trans,
            method: ApiRequestMethod.CREATE
        }
        await globalService.createDocument(saveParams, mysqlConn);
    }

    const soa = {
        customer: previousData.customer,
        description: `Payment received`,
        remark: `${data.remark}${payforInvoice}`,
        transactionType: "CREDIT",
        amount: previousData.amount,
        // account: p.paymentMethod,
        refNo: previousData.id,
        refDate: previousData.postingDate,
        referenceDoc: "Receiving Voucher"
    }

}

export async function onChange(params: ApiParam, mysqlConn: ConnectionAction) {
    const convertUtil = new ConvertUtil();
    const changes = params.body.change;
    const changeKeys = Object.keys(changes);
    const existFormValue = params.body.formValue;
    const formValue: any = {};
    const parentFormValue: any = {};
    const formConfig: any = {};



    if (changeKeys.includes("partyType")) {
        const partyType = changes['partyType'];
        switch (partyType) {
            case "Customer":
            case "Supplier":
                const sqlJson = convertUtil.getSQLJsonValueString('name', params.language)
                const sql = `SELECT ${sqlJson},id FROM ${partyType} WHERE sysAcct = '${params.sys}' AND companyId='${params.com}'`;
                const parties = await mysqlConn.query(sql);
                formConfig['party'] = {
                    type: 'select',
                    options: parties.map((p: any) => { return { value: p.id, label: p.name } }),
                }
                break;
            default:
                formConfig['party'] = {
                    type: 'text',
                }
                break;
        }
        formValue['party'] = null;
    }

    const response = {
        formValue: formValue,
        formConfig: formConfig,
    }

    return response;
}