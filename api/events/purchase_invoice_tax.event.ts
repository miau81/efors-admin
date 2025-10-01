import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiParam } from "../../src/api/interfaces/api.main.interface";
import { ConvertUtil } from "../../src/api/utils/convert";

const convertUtil = new ConvertUtil();

export async function onChange(params: ApiParam, mysqlConn: ConnectionAction) {
  const changes = params.body.change;
  const existFormValue = params.body.formValue;
  const existsParentFormValue = params.body.parentFormValue;
  const changeKeys = Object.keys(changes);
  const formValue: any = {};
  const parentFormValue: any = {};
  const componentOptions: any = {};

  if (changeKeys.includes("taxId") && changes.taxId) {
    const sqlJson = `${convertUtil.getSQLJsonValueString('name', params.language)},chargeBy,rate`;
    const sqlTax = `SELECT ${sqlJson}  FROM supplier_tax WHERE id = '${changes.taxId}' AND sysAcct = '${params.sys}' AND companyId='${params.com}'`;
    const taxId = await mysqlConn.querySingle(sqlTax);
    formValue["name"] = taxId.name;
    formValue["chargeBy"] = taxId.chargeBy;
    formValue["rate"] = taxId.rate;
  }

  const response: any = {
    formValue: formValue,
    componentOptions: componentOptions,
    parentFormValue: parentFormValue
  }
  return response;
}