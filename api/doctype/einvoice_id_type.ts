import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "einvoice_id_type",
        label:"",
        namingType:"random",
        fields:[
            {id:"id",type:"text"},
            {id:"name",type:"text"},
        ]
    }
    return type;
})