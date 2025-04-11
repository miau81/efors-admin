import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";




export const documentType = (() => {
    const type: MyERPDocType = {
        id: "customer",
        label: '{"en":"Customer"}',
        namingType:"byField",
        namingFormat:"email",
        fields: [...myErpFields,
        { id: 'sectionDetails', type: 'section', label: '{"en":"Details"}', sorting: 1 },
        { id: 'name', type: 'text', mandatory: true, label: '{"en":"Name"}', sectionId: 'sectionDetails'},
        { id: 'contactNo', type: 'text', mandatory: true, label: '{"en":"Contact No"}', sectionId: 'sectionDetails' },
        { id: 'email', type: 'text', formComponentType:"email", mandatory: true, label: '{"en":"Email"}', sectionId: 'sectionDetails' },
        { id: 'tinNo', type: 'text', label: '{"en":"Tin No"}', sectionId: 'sectionDetails' },
        { id: 'identificationNo', type: 'text', label: '{"en":"I/C| Passport | Business Reg. No"}', sectionId: 'sectionDetails' },
        { id: 'identificationType', type: 'dropdown', label: '{"en":"Identification Type"}', sectionId: 'sectionDetails' },
        { id: 'sstRegistration', type: 'text', label: '{"en":"SST Registration No"}', sectionId: 'sectionDetails' },

        { id: 'sectionAddress', type: 'section', label: '{"en":"Address"}', sorting: 2 },
        { id: 'address1', type: 'text', label: '{"en":"Address 1"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'address2', type: 'text', label: '{"en":"Address 2"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'address3', type: 'text', label: '{"en":"Address 3"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'city', type: 'text', label: '{"en":"City"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'postcode', type: 'text', label: '{"en":"Postcode"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'stateCode', type: 'text', label: '{"en":"State"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'countryCode', type: 'text', label: '{"en":"Country"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'companyId', type: 'text', isHidden: true },
        ]
    }
    return type;
})



