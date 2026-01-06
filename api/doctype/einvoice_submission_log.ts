import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";

export const documentType = (() => {
    const type: MyERPDocType = {
        id: "einvoice_submission_log",
        label: '{"en":"Einvoice Submission Log"}',
        namingType: "random",
        namingFormat: "",
        searchFields: [],
        isChildTable: true,
        sections: [],
        fields: [
            { id: 'companyId', type: 'text', isHidden: true },
            { id: 'submissionDocument', type: 'text', isHidden: true },
            { id: 'submissionDocumentIds', type: 'text', isHidden: true },
            { id: 'submissionType', type: 'text', isHidden: true },
            { id: 'status', type: 'text', isHidden: true },
            { id: 'submissionlAmount', type: 'currency', isHidden: true },
            { id: 'isSandBox', type: 'boolean', isHidden: true },
            { id: 'submissionUUID', type: 'text', isHidden: true },
            { id: 'validationLink', type: 'text', isHidden: true },
            { id: 'request', type: 'textarea', isHidden: true },
            { id: 'response', type: 'textarea', isHidden: true },
            { id: 'html', type: 'textarea', isHidden: true },
            { id: 'validDocument', type: 'textarea', isHidden: true }
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})