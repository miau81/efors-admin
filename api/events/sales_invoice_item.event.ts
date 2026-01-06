import { SRequest } from "../../src/api/interfaces/api.route.interface";
import { ConvertUtil } from "../../src/api/utils/convert";

export async function onChange(document: string, req: SRequest) {
  const convertUtil = new ConvertUtil();

  const changes = req.body.change;
  const existFormValue = req.body.formValue;
  // const existsParentFormValue = req.body.parentFormValue;
  const changeKeys = Object.keys(changes);
  const formValue: any = {};
  const parentFormValue: any = {};
  const componentOptions: any = {};

  // if (changeKeys.includes("itemId") && changes.itemId) {
  //   const sqlJson = convertUtil.getSQLJsonValueString('name', req.language)
  //   const sqlItem = `SELECT ${sqlJson},uom,unitPrice FROM item WHERE id = '${changes.itemId}' AND sysAcct = '${req.sys}' AND companyId='${req.com}'`;
  //   const item = await req.mysqlConn!.querySingle(sqlItem);
  //   formValue["name"] = item.name;
  //   formValue["uom"] = item.uom;
  //   formValue["unitPrice"] = item.unitPrice || 0;
  //   formValue['amount'] = item.unitPrice * existFormValue['quantity'];
  // }

  const response: any = {
    formValue: formValue,
    componentOptions: componentOptions,
    parentFormValue: parentFormValue
  }
  return response;
}