import { SRequest } from "../../src/api/interfaces/api.route.interface";
import { ConvertUtil } from "../../src/api/utils/convert";

const convertUtil = new ConvertUtil();

export async function onChange(document:string,req:SRequest) {
  const changes = req.body.change;
  // const existFormValue = req.body.formValue;
  // const existsParentFormValue = req.body.parentFormValue;
  const changeKeys = Object.keys(changes);
  const formValue: any = {};
  const parentFormValue: any = {};
  const componentOptions: any = {};

  if (changeKeys.includes("taxId") && changes.taxId) {
    const sqlJson = `${convertUtil.getSQLJsonValueString('name', req.language)},chargeBy,rate`;
    const sqlTax = `SELECT ${sqlJson}  FROM supplier_tax WHERE id = '${changes.taxId}' AND sysAcct = '${req.sys}' AND companyId='${req.com}'`;
    const taxId = await req.mysqlConn!.querySingle(sqlTax);
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