import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
// import ejs from "ejs";
import { TranslateModule } from '@ngx-translate/core';
import { MyERPPrintFormat } from '@myerp/interfaces/interface';
import { NgSelectModule } from '@ng-select/ng-select';
import { ShareModule } from '../../@modules/share/share.module';

@Component({
  selector: 'app-print',
  imports: [TranslateModule, NgSelectModule, ShareModule],
  templateUrl: './print.component.html',
  styleUrl: './print.component.scss'
})
export class PrintComponent {
  public dialogData = inject(MAT_DIALOG_DATA, { optional: true });
  public selectedFormat?: string;
  public printFormats: MyERPPrintFormat[] = [];
  public printHtml: string = '';
  constructor(private dialog: MatDialog, private api: ApiService) {

  }

  async ngOnInit() {
    this.printFormats = this.dialogData.documentType.printFormats
    this.selectedFormat = (this.printFormats.find(f => f.isDefault) || this.printFormats[0]).code;
    await this.loadPrinting();
  }

  async loadPrinting() {
    const format = this.printFormats.find(f => f.code == this.selectedFormat);
    const data = {
      action: 'onPrint',
      data: this.dialogData.formValue,
      format: format?.fileName
      // documentId: this.documentId,
      // documentType: this.documentType
    }
    let response:any;
    switch (this.dialogData.documentType.printScript) {
      case "SERVER":
        response = await this.api.runEventScript(this.dialogData.documentType.id, data);
        console.log(response)
        this.printHtml = response.html
        break;
      case "CLIENT":
        // const module = await import(/* @vite-ignore */`/assets/client-script/events/${this.dialogData.documentId}-event.js`);
        // response = await module.onPrint(data);
        // const templateFile = `/assets/client-script/print/${format?.fileName}`;
        // const html = await ejs.renderFile(templateFile, response);
        break;
    }

  }

  onPrint() {

  }

}
