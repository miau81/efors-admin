import { MyERPDocType } from "@myerp/interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "state",
        label:"",
        namingType:"random",
        fields:[
            {id:"id",type:"text"},
            {id:"einvoice_code",type:"text"},
            {id:"name",type:"text"},
            {id:"country",type:"text"},
        ]
    }
    return type;
})