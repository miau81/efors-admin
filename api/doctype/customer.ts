import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";




export const documentType = (() => {
    const type: MyERPDocType = {
        id: "customer",
        label: '{"en":"Customer"}',
        namingType: "byField",
        namingFormat: "name",
        sections: [
            { id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1 },
            { id: 'sectionAddress', label: '{"en":"Address"}', sorting: 2 }
        ],
        fields: [

            { id: 'name', type: 'text', mandatory: true, label: '{"en":"Name"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'contactNo', type: 'text', mandatory: true, label: '{"en":"Contact No"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'email', type: 'text', formComponentType: "email", mandatory: true, label: '{"en":"Email"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'tinNo', type: 'text', label: '{"en":"Tin No"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'identificationNo', type: 'text', label: '{"en":"I/C| Passport | Business Reg. No"}', showInForm: true, sectionId: 'sectionDetails' },
            {
                id: 'identificationType', type: 'link', options: "einvoice_id_type", showInForm: true,
                linkOptions: { valueField: "id", labelField: "id,name" },
                label: '{"en":"Identification Type"}', sectionId: 'sectionDetails'
            },
            { id: 'sstRegistration', type: 'text', label: '{"en":"SST Registration No"}', showInForm: true, sectionId: 'sectionDetails' },


            { id: 'address1', type: 'text', label: '{"en":"Address 1"}', showInForm: true, sectionId: "sectionAddress" },
            { id: 'address2', type: 'text', label: '{"en":"Address 2"}', showInForm: true, sectionId: "sectionAddress" },
            { id: 'address3', type: 'text', label: '{"en":"Address 3"}', showInForm: true, sectionId: "sectionAddress" },
            { id: 'postcode', type: 'text', label: '{"en":"Postcode"}', showInForm: true, sectionId: "sectionAddress" },
            { id: 'city', type: 'text', label: '{"en":"City"}', showInForm: true, sectionId: "sectionAddress" },
            {
                id: 'stateCode', type: 'link', options: "state", showInForm: true,
                linkOptions: { valueField: "einvoice_code", labelField: "name" },
                label: '{"en":"State"}', sectionId: "sectionAddress"
            },
            {
                id: 'countryCode', type: 'link', options: "country", defaultValue: "MYS", showInForm: true,
                linkOptions: { valueField: "einvoice_code", labelField: "name" },
                label: '{"en":"Country"}', sectionId: "sectionAddress"
            },
            { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    type.fields = [...myErpFields.filter(df => !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})



