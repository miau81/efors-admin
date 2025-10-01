import { myErpFields } from "../../src/app/@interfaces/const";
import { MyERPDocType } from "../../src/app/@interfaces/interface";




export const documentType = (() => {
    const type: MyERPDocType = {
        id: "company",
        label: '{"en":"Company"}',
        namingType: "byField",
        namingFormat: "code",
        tabs: [
            { id: 'tabDetails', label: '{"en":"Details"}', sorting: 1 },
            { id: 'tabAcctount', label: '{"en":"Account"}', sorting: 2, sectionExpanded: false },
            { id: 'tabEInvoice', label: '{"en":"E-Invoice Setting"}', sorting: 3, sectionExpanded: false, parent: 'tabEinvoice' }
        ],
        sections: [
            { id: 'sectionDetails', label: '{"en":"Details"}', sorting: 1, parent: 'tabDetails' },
            { id: 'sectionAddress', label: '{"en":"Address"}', sorting: 2, sectionExpanded: false, parent: 'tabDetails' },
            { id: 'sectionAccount', label: '{"en":"Account"}', sorting: 2, parent: 'tabAcctount' },
            { id: 'sectionEInvoice', label: '{"en":"E-Invoice Settings"}', sorting: 1, parent: 'tabEInvoice' },
        ],
        fields: [

            // Section Details
            { id: 'code', type: 'text', isNotEditable: true, mandatory: true, label: '{"en":"Company Code"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'companyName', type: 'text', mandatory: true, label: '{"en":"Company Name"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'contactNo', type: 'text', mandatory: true, label: '{"en":"Contact No"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'email', type: 'text', formComponentType: "email", mandatory: true, label: '{"en":"Email"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'tinNo', type: 'text', label: '{"en":"Tin No"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            { id: 'businessRegNo', type: 'text', label: '{"en":"Business Registration No"}', showInTable: true, showInForm: true, sectionId: 'sectionDetails' },
            {
                id: 'identificationType', type: 'link', options: "einvoice_id_type", showInForm: true,
                linkOptions: { valueField: "id", labelField: "id,name" },
                label: '{"en":"Identification Type"}', sectionId: 'sectionDetails'
            },
            { id: 'sstRegistration', type: 'text', label: '{"en":"SST Registration No"}', showInForm: true, sectionId: 'sectionDetails' },
            {
                id: 'industryClassification', mandatory: true, type: 'link', options: "einvoice_misc", showInForm: true,
                linkOptions: { valueField: "id", labelField: "id,name" },
                label: '{"en":"Industry Classification"}', sectionId: "sectionDetails"
            },
            //Section Address
            // { id: 'sectionAddress', type: 'section', label: '{"en":"Address"}', sorting: 2, sectionExpanded: false, tabId: 'tabDetails' },
            { id: 'address1', type: 'text', label: '{"en":"Address 1"}', showInForm: true, sectionId: "sectionAddress" },
            { id: 'address2', type: 'text', label: '{"en":"Address 2"}', showInForm: true, sectionId: "sectionAddress" },
            { id: 'address3', type: 'text', label: '{"en":"Address 3"}', showInForm: true, sectionId: "sectionAddress" },
            { id: 'postcode', type: 'text', label: '{"en":"Postcode"}', showInForm: true, sectionId: "sectionAddress" },
            { id: 'city', type: 'text', label: '{"en":"City"}', showInForm: true, sectionId: "sectionAddress" },
            {
                id: 'stateCode', type: 'link', options: "state", showInForm: true,
                linkOptions: { valueField: "einvoice_code", labelField: "name" },
                label: '{"en":"State"}', sectionId: "sectionAddress",
            },
            {
                id: 'countryCode', type: 'link', options: "country", defaultValue: "MYS", showInForm: true,
                linkOptions: { valueField: "einvoice_code", labelField: "name" },
                label: '{"en":"Country"}', sectionId: "sectionAddress"
            },
            //Section Account
             {
                id: 'accounts', type: "table", formColumnSize: "col-12", showInForm: true, formComponentType: "table", label: '{"en":"Accounts"}',
                sectionId: 'sectionAccount', options: "company_account", callClientScript: true
            },
            //Section E-Invoice
            // { id: 'sectionEInvoice', type: 'section', label: '{"en":"E-Invoice Setting"}', sorting: 3, sectionExpanded: false, tabId: 'tabEinvoice' },
            { id: 'eInvoiceIdSandbox', type: 'text', label: '{"en":"E-Invoice ID (For Testing Mode)"}', showInForm: true, sectionId: "sectionEInvoice" },
            { id: 'eInvoiceSecretSandbox', type: 'text', label: '{"en":"E-Invoice Secret(For Testing Mode)"}', showInForm: true, sectionId: "sectionEInvoice" },
            { id: 'break_1', type: 'breakline', showInForm: true, sectionId: 'sectionEInvoice' },
            { id: 'eInvoiceId', type: 'text', label: '{"en":"E-Invoice ID"}', showInForm: true, sectionId: "sectionEInvoice" },
            { id: 'eInvoiceSecret', type: 'text', label: '{"en":"E-Invoice Secret"}', showInForm: true, sectionId: "sectionEInvoice" },
            { id: 'break_2', type: 'breakline', showInForm: true, sectionId: 'sectionEInvoice' },

            {
                id: 'defaultTaxableType', type: 'link', options: "einvoice_taxable_type", showInForm: true,
                linkOptions: { valueField: "id", labelField: "id,name" },
                label: '{"en":"Default Taxable Type"}', sectionId: "sectionEInvoice"
            },
            {
                id: 'defaultItemClassification', type: 'link', options: "einvoice_classification", showInForm: true,
                linkOptions: { valueField: "id", labelField: "id,name" },
                label: '{"en":"Default Item Classfication"}', sectionId: "sectionEInvoice"
            },
            {
                id: 'defaultItemUOM', type: 'link', options: "einvoice_item_uom", showInForm: true,
                linkOptions: { valueField: "id", labelField: "id,name" },
                label: '{"en":"Default Item UOM"}', sectionId: "sectionEInvoice"
            },

        ]
    }
    type.fields = [...myErpFields.filter(df => df.id != 'sysAcct' && !type.fields.some(f => f.id == df.id)), ...type.fields];
    return type;
})


