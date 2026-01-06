import { InjectionToken } from "@angular/core";
import { DocumentComponent } from "../pages/document/document.component";
import { MyFormComponent } from "../@core/components/form-generator/form-generator.component";

export abstract class DocType {
    protected parent!: DocumentComponent;
    abstract readonly docType: string; // e.g. 'invoice'

    init(parent: DocumentComponent) {
        this.parent = parent;
    }

   async onLoad?():Promise<void>;
   async onFormChange?(change: any, existFormValue: any, existsParentFormValue?: any, isInit?: boolean, index?: number):Promise<any>
}



export const DOCUMENT_SCRIPTS = new InjectionToken<DocType[]>('DOCUMENT_SCRIPTS');
