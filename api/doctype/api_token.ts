import { MyERPDocType } from "../../src/app/@interfaces/interface"

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "api_token",
        label:"",
        namingType:"random",
        fields:[
            {id:"id",type:"text"},
            {id:"token",type:"text"},
            {id:"isActive",type:"boolean"},
            {id:"projectName",type:"text"}
        ]
    }
    return type;
})