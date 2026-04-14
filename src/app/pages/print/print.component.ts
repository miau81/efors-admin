import { Component, HostListener, inject, signal } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { MyERPPrintFormat } from '../../@interfaces/interface';
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
  // Using inject()
  readonly dialogRef = inject(DialogRef<PrintComponent>);
  readonly dialogData = inject(DIALOG_DATA, { optional: true });

  // Using signals for reactive state
  readonly selectedFormat = signal<string | undefined>(undefined);
  readonly printFormats = signal<MyERPPrintFormat[]>([]);
  readonly printHtml = signal<string>('');
  readonly pages = signal<string[]>([]);
  readonly styles = signal<SafeHtml | undefined>(undefined);
  readonly zoomLevel = signal<number>(1);

  // Constants
  readonly minZoom = 0.5;
  readonly maxZoom = 3;
  readonly zoomStep = 0.1;

  // Using inject() for services
  private readonly api = inject(ApiService);
  private readonly baseService = inject(BaseService);
  private readonly sanitizer = inject(DomSanitizer);

  async ngOnInit() {
    const data = this.dialogData;
    this.printFormats.set(data.documentType.printFormats);
    const defaultFormat = this.printFormats().find(f => f.isDefault) || this.printFormats()[0];
    this.selectedFormat.set(defaultFormat?.code);
    await this.loadPrinting();
  }

  async loadPrinting() {
    const format = this.printFormats().find(f => f.code == this.selectedFormat());
    const params = { getChild: true, getLink: true };
    const doc = await this.api.getDocument(this.dialogData.documentType.id, this.dialogData.documentId, params);
    const data = {
      action: 'onPrint',
      data: doc,
      format: format?.fileName
    }
    let response: any;
    switch (this.dialogData.documentType.printScript) {
      case "SERVER":
        response = await this.api.runEventScript(this.dialogData.documentType.id, data, params);
        this.printHtml.set(response.html);
        break;
      case "CLIENT":
        break;
    }
    this.splitIntoCards(this.printHtml());
    this.extractStyles(this.printHtml());
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
        groups.push(current.outerHTML + next.outerHTML);
        i++;
      } else {
        groups.push(current.outerHTML);
      }
    }

    this.pages.set(groups);
  }

  extractStyles(html: string) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const styles = Array.from(tempDiv.querySelectorAll('style'));
    const cssText = styles.map(style => style.outerHTML).join('\n');
    this.styles.set(this.sanitizer.bypassSecurityTrustHtml(cssText));
  }

  async onPrint() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(this.printHtml());
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  }

  async onShare() {
    const generatedFile = await this.generateFile("pdf");
    const file = new File([generatedFile.blob], generatedFile?.fileName || '', { type: generatedFile.blob.type });
    window.navigator.share({ files: [file] });
  }

  dismiss() {
    this.dialogRef.close();
  }

  async generateFile(type: 'pdf' | 'xlsx') {
    try {
      await this.baseService.showLoading();
      const fileName = `${this.dialogData.documentType.id.toUpperCase()}-${this.dialogData.documentId}.${type}`;
      const body = {
        html: this.printHtml(),
        type: type,
        fileName: fileName
      };
      return { blob: await this.api.htmlToFile(body), fileName: fileName };
    } catch (error: any) {
      await this.baseService.showErrorMessage(error);
      throw error;
    } finally {
      await this.baseService.dismissLoading();
    }
  }

  async exportPrint(type: 'pdf' | 'xlsx') {
    const generatedFile = await this.generateFile(type);
    const url = window.URL.createObjectURL(generatedFile.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generatedFile.fileName;
    a.click();
    if (isDesktop()) {
      const pdfWindow = window.open(url);
      const poll = setInterval(() => {
        if (pdfWindow?.closed) {
          clearInterval(poll);
          window.URL.revokeObjectURL(url);
        }
      }, 500);
    }
  }

  zoomIn() {
    if (this.zoomLevel() < this.maxZoom) {
      this.zoomLevel.update(v => parseFloat((v + this.zoomStep).toFixed(2)));
    }
  }

  zoomOut() {
    if (this.zoomLevel() > this.minZoom) {
      this.zoomLevel.update(v => parseFloat((v - this.zoomStep).toFixed(2)));
    }
  }

  resetZoom() {
    this.zoomLevel.set(1);
  }

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }

  get transformStyle(): string {
    return `scale(${this.zoomLevel()})`;
  }
}
