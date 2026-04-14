

import { DocTypeEvent } from "./core/doctype.event";
import { roundToDecimal } from "@myerp/utils/misc";


export default class Item extends DocTypeEvent {

    constructor() {
        super();
    }

    override docType: string = "item";

    override async onLoad(): Promise<void> {
        this.setShowHideBundeItems(this.parent.getValue("type"));
        this.setMandatorySellingPrice(this.parent.getValue("allowSales"));

    }

    override async onFormChange(key: string, value: any, childTableIndex?: number): Promise<void> {

        if (key == "barcodes") {
            this.parent.setValue("type", "BUNDLE");
        }

        if (key == "type") {
            this.setShowHideBundeItems(value);
        }

        if (key == "allowSales") {
            this.setMandatorySellingPrice(value);
        }

    }


    // override async onFormChange(change: any, existFormValue: any, existsParentFormValue?: any, isInit?: boolean, index?: number): Promise<any> {
    //     const changeKey = Object.keys(change)[0];
    //     const formValue: any = {};
    //     const parentFormValue: any = {};
    //     const componentOptions = {};

    //     if (changeKey == "type") {
    //         this.setShowHideBundeItems(change.type);
    //     }

    //     if (changeKey == "allowSales") {
    //        this.setMandatorySellingPrice(change.allowSales);
    //     }


    //     const response = {
    //         formValue: formValue,
    //         componentOptions: componentOptions,
    //         parentFormValue: parentFormValue
    //     }
    //     return response;
    // }



    private setShowHideBundeItems(itemType: string) {
        const showHideBundle = itemType == "BUNDLE" ? "table" : "hidden";
        this.parent.setProperty("bundleItems", "type", showHideBundle);
        this.parent.setProperty("bundleItems", "required", itemType == "BUNDLE");
    }

    private setMandatorySellingPrice(allowSales: boolean) {
        const mandatoryDefaultSellingPrice = this.parent.getValue("allowSales") ? true : false;
        this.parent.setProperty("defaultSellingPrice", "required", mandatoryDefaultSellingPrice);
    }

}












