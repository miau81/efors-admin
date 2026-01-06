import { MyERPDocType } from "@myerp/interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "item_type",
        label:"",
        namingType:"random",
        fields:[
            {id:"id",type:"text"},
            {id:"name",type:"text"},
        ]
    }
    return type;
})