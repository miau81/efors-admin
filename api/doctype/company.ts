import { ConnectionAction } from "../../src/api/interfaces/api.db.interface";
import { ApiParam } from "../../src/api/interfaces/api.main.interface";
import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";




export const documentType = (() => {
    const type: MyERPDocType = {
        id: "company",
        label: '{"en":"Company"}',
        namingType: "byField",
        namingFormat: "code",
        fields: [...myErpFields,
        { id: 'sectionDetails', type: 'section', label: '{"en":"Details"}', sorting: 1 },
        { id: 'code', type: 'text', mandatory: true, label: '{"en":"Company Code"}', sectionId: 'sectionDetails' },
        { id: 'companyName', type: 'text', mandatory: true, label: '{"en":"Company Name"}', sectionId: 'sectionDetails' },
        { id: 'contactNo', type: 'text', mandatory: true, label: '{"en":"Contact No"}', sectionId: 'sectionDetails' },
        { id: 'email', type: 'text', formComponentType: "email", mandatory: true, label: '{"en":"Email"}', sectionId: 'sectionDetails' },
        { id: 'tinNo', type: 'text', label: '{"en":"Tin No"}', sectionId: 'sectionDetails' },
        { id: 'businessRegNo', type: 'text', label: '{"en":"Business Registration No"}', sectionId: 'sectionDetails' },
        { id: 'identificationType', type: 'dropdown', label: '{"en":"Identification Type"}', sectionId: 'sectionDetails' },
        { id: 'sstRegistration', type: 'text', label: '{"en":"SST Registration No"}', sectionId: 'sectionDetails' },
        { id: 'sectionAddress', type: 'section', label: '{"en":"Address"}', sorting: 2 },
        { id: 'address1', type: 'text', label: '{"en":"Address 1"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'address2', type: 'text', label: '{"en":"Address 2"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'address3', type: 'text', label: '{"en":"Address 3"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'city', type: 'text', label: '{"en":"City"}', sectionId: "sectionAddress", hideInTable: true },
        { id: 'postcode', type: 'text', label: '{"en":"Postcode"}', sectionId: "sectionAddress", hideInTable: true },
        {
            id: 'stateCode', type: 'link', options: "state",
            linkOptions: { valueField: "einvoice_code", labelField: "name" },
            label: '{"en":"State"}', sectionId: "sectionAddress", hideInTable: true
        },
        { id: 'countryCode', type: 'text', label: '{"en":"Country"}', sectionId: "sectionAddress", hideInTable: true },

        { id: 'sectionEInvoice', type: 'section', label: '{"en":"E-Invoice Setting"}', sorting: 3 },
        { id: 'isSandBox', type: 'boolean', label: '{"en":"Testing Mode"}', sectionId: "sectionEInvoice", hideInTable: true },
        { id: 'eInvoiceId', type: 'text', label: '{"en":"E-Invoice ID"}', sectionId: "sectionEInvoice", hideInTable: true },
        { id: 'eInvoiceSecret', type: 'text', label: '{"en":"E-Invoice Secret"}', sectionId: "sectionEInvoice", hideInTable: true },
        { id: 'industryClassification', type: 'text', label: '{"en":"Industry Classification"}', sectionId: "sectionEInvoice", hideInTable: true },
        { id: 'defaultTaxableType', type: 'text', label: '{"en":"Default Taxable Type"}', sectionId: "sectionEInvoice", hideInTable: true },
        { id: 'defaultItemClassification', type: 'text', label: '{"en":"Default Item Classfication"}', sectionId: "sectionEInvoice", hideInTable: true },
        { id: 'defaultItemUOM', type: 'text', label: '{"en":"Default Item UOM"}', sectionId: "sectionEInvoice", hideInTable: true },

        ]
    }
    return type;
})


