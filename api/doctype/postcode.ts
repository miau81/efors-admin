import { MyERPDocType } from "../../src/app/@interfaces/interface";;

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "postcode",
        label:"",
        namingType:"random",
        fields:[
            {id:"id",type:"text"},
            {id:"postcode",type:"text"},
            {id:"city",type:"text"},
            {id:"state",type:"text"},
            {id:"country",type:"text"},
        ]
    }
    return type;
})