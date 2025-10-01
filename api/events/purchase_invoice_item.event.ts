import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiParam } from "../../src/api/interfaces/api.main.interface";
import { ExternalScriptService } from "../../src/api/services/api.extermal-script.service";
import { ApiGlobalService } from "../../src/api/services/api.global.service";
import { ConvertUtil } from "../../src/api/utils/convert";



export async function onChange(params: ApiParam, mysqlConn: ConnectionAction) {
  const convertUtil = new ConvertUtil();
  const c = new ExternalScriptService()
  const d = new ApiGlobalService()

  const changes = params.body.change;
  const existFormValue = params.body.formValue;
  const existsParentFormValue = params.body.parentFormValue;
  const changeKeys = Object.keys(changes);
  const formValue: any = {};
  const parentFormValue: any = {};
  const componentOptions: any = {};



  if (changeKeys.includes("itemId") && changes.itemId) {
    const sqlJson = convertUtil.getSQLJsonValueString('name', params.language)
    const sqlItem = `SELECT ${sqlJson},uom,unitPrice FROM item WHERE id = '${changes.itemId}' AND sysAcct = '${params.sys}' AND companyId='${params.com}'`;
    const item = await mysqlConn.querySingle(sqlItem);
    formValue["name"] = item.name;
    formValue["uom"] = item.uom;
    formValue["unitPrice"] = item.unitPrice || 0;
    formValue['amount'] = item.unitPrice * existFormValue['quantity'];
  }

  const response: any = {
    formValue: formValue,
    componentOptions: componentOptions,
    parentFormValue: parentFormValue
  }
  return response;
}