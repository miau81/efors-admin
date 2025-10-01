import { Component, HostListener, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
// import ejs from "ejs";
import { TranslateModule } from '@ngx-translate/core';
import { MyERPPrintFormat } from '@myerp/interfaces/interface';
import { NgSelectModule } from '@ng-select/ng-select';
import { ShareModule } from '../../@modules/share/share.module';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { isDesktop } from '@myerp/utils/misc';
import { BaseService } from '../../services/base.service';
import { DialogRef } from '@angular/cdk/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-print',
  imports: [TranslateModule, NgSelectModule, ShareModule, NgbDropdownModule],
  templateUrl: './print.component.html',
  styleUrl: './print.component.scss'
})
export class PrintComponent {
  readonly dialogRef = inject(DialogRef<PrintComponent>)
  public dialogData = inject(DIALOG_DATA, { optional: true });
  public selectedFormat?: string;
  public printFormats: MyERPPrintFormat[] = [];
  public printHtml: string = '';
  public pages: string[] = [];
  public styles!:SafeHtml;

  zoomLevel: number = 1; // Initial zoom level (1 = 100%)
  minZoom: number = 0.5; // Minimum zoom level
  maxZoom: number = 3;   // Maximum zoom level
  zoomStep: number = 0.1; // How much to change zoom by each step

  constructor(private api: ApiService, private baseService: BaseService,private sanitizer: DomSanitizer) {

  }

  async ngOnInit() {
    this.printFormats = this.dialogData.documentType.printFormats
    this.selectedFormat = (this.printFormats.find(f => f.isDefault) || this.printFormats[0]).code;
    await this.loadPrinting();
  }

  async loadPrinting() {
    const format = this.printFormats.find(f => f.code == this.selectedFormat);
    const doc = await this.api.getDocumentByField(this.dialogData.documentType.id, 'id', this.dialogData.documentId);
    const data = {
      action: 'onPrint',
      data: doc,
      format: format?.fileName
      // documentId: this.documentId,
      // documentType: this.documentType
    }
    let response: any;
    switch (this.dialogData.documentType.printScript) {
      case "SERVER":
        response = await this.api.runEventScript(this.dialogData.documentType.id, data);
        this.printHtml = response.html
        break;
      case "CLIENT":
        // const module = await import(/* @vite-ignore */`/assets/client-script/events/${this.dialogData.documentId}.event.js`);
        // response = await module.onPrint(data);
        // const templateFile = `/assets/client-script/print/${format?.fileName}`;
        // const html = await ejs.renderFile(templateFile, response);
        break;
    }
    // document.getElementById('print-container')!.innerHTML = this.printHtml;
    this.splitIntoCards(this.printHtml);
    this.extractStyles(this.printHtml);

  }

  splitIntoCards(html: string) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const divElements = Array.from(tempDiv.querySelectorAll('div[id]'));

    const groups: string[] = [];

    for (let i = 0; i < divElements.length; i++) {
      const current = divElements[i];
      const next = divElements[i + 1];

      if (current.id.startsWith("page") && next?.id.startsWith("next")) {
        // Pair A + B
        groups.push(current.outerHTML + next.outerHTML);
        i++; // skip next because it’s already paired
      } else {
        // Single (A alone or B without A before it)
        groups.push(current.outerHTML);
      }
    }

    this.pages = groups;
  }

  extractStyles(html: string) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Move styles to head
   const styles = Array.from(tempDiv.querySelectorAll('style'));

  // Extract their text
    const cssText = styles.map(style => style.outerHTML).join('\n');

  
    this.styles= this.sanitizer.bypassSecurityTrustHtml(cssText); // return cleaned HTML without <style>
  }

  async onPrint() {

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Write the HTML content

    printWindow.document.open();
    printWindow.document.write(this.printHtml);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();

      // Try to close after print dialog (works in most browsers)
      printWindow.onafterprint = () => {
        printWindow.close();
      };

      // Fallback: close after a timeout (in case onafterprint doesn't fire)
      // setTimeout(() => {
      printWindow.close();
      // }, 1000);
    };

    // const b=await puppeteer.launch({headless:false,args: ['--no-sandbox', '--disable-setuid-sandbox'],})
    // const pdfBuffer: any = await this.api.generatePdf({ html: `<html><body>ssssss</body></html>` });
    // const url = window.URL.createObjectURL(pdfBuffer);
    // const a = document.createElement('a');
    // a.href = url;
    // a.download = 'e-invoice.pdf';
    // a.click();
    // window.URL.revokeObjectURL(url)
  }

  dismiss() {
    this.dialogRef.close();
  }

  async exportPrint(type: 'pdf' | 'xlsx') {
    this.baseService.showLoading();
    const body = {
      html: this.printHtml,
      type: type,
      fileName: `${this.dialogData.documentType.id}-${this.dialogData.documentId}.${type}`
    };
    const data = await this.api.htmlToFile(body);

    const url = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = body.fileName;
    a.click();
    if (isDesktop()) {
      const pdfWindow = window.open(url)
      const poll = setInterval(() => {
        if (pdfWindow?.closed) {
          clearInterval(poll);
          window.URL.revokeObjectURL(url);
        }
      }, 500);
    }
    this.baseService.dismissLoading();
    // 

  }

  zoomIn() {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel += this.zoomStep;
      this.zoomLevel = parseFloat(this.zoomLevel.toFixed(2)); // Prevent floating point inaccuracies
    }
  }

  zoomOut() {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel -= this.zoomStep;
      this.zoomLevel = parseFloat(this.zoomLevel.toFixed(2)); // Prevent floating point inaccuracies
    }
  }

  resetZoom() {
    this.zoomLevel = 1;
  }

  // Optional: Handle mouse wheel for zooming
  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault(); // Prevent page scrolling
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }

  // Get the transform style string
  get transformStyle(): string {
    return `scale(${this.zoomLevel})`;

  }
}
