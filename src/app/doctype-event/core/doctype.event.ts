
import { DocumentComponent } from "../../pages/document/document.component";

export abstract class DocTypeEvent {
    protected parent!: DocumentComponent;
    abstract readonly docType: string; // e.g. 'invoice'

    init(parent: DocumentComponent) {
        this.parent = parent;
    }

    async onLoad?(): Promise<void>;
    async onFormChange?(change: any, existFormValue: any, existsParentFormValue?: any, isInit?: boolean, index?: number): Promise<any>
    async onBeforeSave?(): Promise<{ skip?: boolean } | void>;
    async onBeforeSubmit?(): Promise<{ skip?: boolean } | void>;
    async onBeforeCancel?(): Promise<{ skip?: boolean } | void>;
    async onAfterSave?(): Promise<void>;
    async onAfterSubmit?(): Promise<void>;
    async onAfterCancel?(): Promise<void>;

}




