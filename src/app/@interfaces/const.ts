import { MyERPField } from "./interface"
import { version } from '../../../package.json'

export const APP_PARAMS = {
    systemName:"Business Management System",
    appName: "Efors",
    slogan:"Business Made Effortless",
    tagline:"Smart, Simple, Scalable",
    defaultProfileImage: "./assets/images/default_sp_profile.png",
    defaultImage: "./assets/images/no-image.jpg",
    version: `v${version}`
}

export const myErpFields: MyERPField[] = [
    { id: "idx", type: "text", label:'{"en":"Idx"}', isReadOnly:true , isPrimaryKey:true},
    { id: "id", type: "text", label:'{"en":"ID"}', isHidden: true, isReadOnly:true},
    { id: "createdDate", type: "datetime", isHidden: true, label:'{"en":"Created Date"}' },
    { id: "createdBy", type: "text", isHidden: true , label:'{"en":"Created By"}'},
    { id: "modifiedDate", type: "datetime", isHidden: true , label:'{"en":"Modified By"}'},
    { id: "lastModifiedBy", type: "text", isHidden: true , label:'{"en":"Last Modified Date"}'},
    { id: "docStatus", type: "text", isHidden: true, defaultValue:'DRAFT' , label:'{"en":"Status"}'},
    { id: "isActive", type: "boolean", isHidden: true, defaultValue: true , label:'{"en":"Active"}'},
    { id: "isDeleted", type: "boolean", isHidden: true, defaultValue: false , label:''},
    { id: "sysAcct", type: "text", isHidden: true, defaultValue: false , label:''},
]
