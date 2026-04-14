

import { DocTypeEvent } from "./core/doctype.event";
import { roundToDecimal } from "@myerp/utils/misc";


export default class Branch extends DocTypeEvent {

    constructor() {
        super();
    }

    override docType: string = "branch";

    override async onLoad(): Promise<void> {
        const config = this.parent.formConfig()
        if (config?.form.getRawValue().isMainBranch) {
            const keys = ["sameAsMainBranchInfo", "sameAsMainBranchEInvoice"];
            const components = config?.components.filter(c => keys.includes(c.key));
            for (const c of components || []) {
                c.type = "hidden"
            }
        }
    }


    override async onFormChange(change: any, existFormValue: any, existsParentFormValue?: any, isInit?: boolean, index?: number): Promise<any> {
        const changeKey = Object.keys(change)[0];
        const formValue: any = {};
        const parentFormValue: any = {};
        const componentOptions = {};

        if (changeKey == "sameAsMainBranchInfo") {
            const keys = [
                "businessRegName", "contactNo",
                "email", "tinNo", "businessRegNo",
                "businessActivity", "identificationType",
                "sstRegistration", "industryClassification"
            ];
            const components = this.parent.formConfig()?.components.filter(c => keys.includes(c.key));
            for (const c of components || []) {
                c.readonly = change.sameAsMainBranchInfo;
                if (change.sameAsMainBranchInfo) {
                    c.required = false;
                } else {
                    if (change.sameAsMainBranchInfo) {
                        c.required = false;
                    } else {
                        switch (c.key) {
                            case "businessRegName":
                            case "contactNo":
                            case "email":
                            case "industryClassification":
                                c.required = true;
                        }
                    }
                }
            }

        }
        if (changeKey == "sameAsMainBranchEInvoice") {
            const keys = [
                "eInvoiceIdSandbox", "eInvoiceSecretSandbox",
                "eInvoiceId", "eInvoiceSecret", "isEinvoiceSandbox",
                "defaultTaxableType", "defaultItemClassification", "defaultItemUOM"
            ];
            const components = this.parent.formConfig()?.components.filter(c => keys.includes(c.key));
            console.log(components)
            for (const c of components || []) {
                c.readonly = change.sameAsMainBranchEInvoice;
            }

        }


        const response = {
            formValue: formValue,
            componentOptions: componentOptions,
            parentFormValue: parentFormValue
        }
        return response;
    }

}












