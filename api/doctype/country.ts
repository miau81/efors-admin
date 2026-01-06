import { MyERPDocType } from "@myerp/interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "country",
        label:"",
        namingType:"random",
        fields:[
            {id:"id",type:"text"},
            {id:"einvoice_code",type:"text"},
            {id:"name",type:"text"},
        ]
    }
    return type;
})