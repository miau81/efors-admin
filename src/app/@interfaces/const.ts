import { MyERPField } from "./interface"

export const APP_PARAMS = {
    appName: "EZ E-Invoice",
    defaultProfileImage: "./assets/images/default_sp_profile.png",
    defaultImage: "./assets/images/no-image.jpg",
}

export const myErpFields: MyERPField[] = [
    { id: "id", type: "text", label:'{"en":"ID"}',formComponentType:"readOnly" , isPrimaryKey:true},
    { id: "createdDate", type: "datetime", isHidden: true, label:'{"en":"Created Date"}', hideInForm:true },
    { id: "createdBy", type: "text", isHidden: true , label:'{"en":"Created By"}'},
    { id: "modifiedDate", type: "datetime", isHidden: true , label:'{"en":"Modified By"}'},
    { id: "lastModifiedBy", type: "text", isHidden: true , label:'{"en":"Last Modified Date"}'},
    { id: "docStatus", type: "text", isHidden: true, defaultValue:'DRAFT' , label:'{"en":"Status"}'},
    { id: "isActive", type: "boolean", isHidden: true, defaultValue: true , label:'{"en":"Active"}'},
    { id: "isDeleted", type: "boolean", isHidden: true, defaultValue: false , label:''},
    { id: "sysAcct", type: "text", isHidden: true, defaultValue: false , label:''},
]
