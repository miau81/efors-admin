import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { MyMessageBox } from '@myerp/components';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root'
})
export class MyMessageBoxService {

  // readonly dialog = inject(MatDialog);
  // readonly toast = inject(MatSnackBar);
  private loadingDialogRef?: MatDialogRef<MyMessageBox>;
  constructor(private dialog: MatDialog, private toast: MatSnackBar, private translateService: TranslateService) { }


  async showAlertMessage(option: { title?: string; message: string; type?: 'warning' | 'success' | 'info' | 'error' }): Promise<MyMessageBoxResponse> {
    const trans = await firstValueFrom(this.translateService.get([option.title || '', option.message]))
    return await this.showMessageBox({
      title: trans[option.title || ''],
      message: trans[option.message],
      type: option.type,
      button: 'OkOnly',
      disableClose: false
    })
  }
  async showConfirmMessage(option: { title?: string; message: string; cancelButton?: boolean }): Promise<MyMessageBoxResponse> {
    const trans = await firstValueFrom(this.translateService.get([option.title || '', option.message]))
    return await this.showMessageBox({
      title: trans[option.title || ''],
      message: trans[option.message],
      type: "question",
      button: option.cancelButton ? 'YesNoCancel' : 'YesNo',
      disableClose: true
    })
  }

  async showInputConfirmMessage(option: { title?: string; message: string; confirmKey?: string }): Promise<MyMessageBoxResponse> {
    const trans = await firstValueFrom(this.translateService.get([option.title || '', option.message]))
    return await this.showMessageBox({
      title: trans[option.title || ''],
      message: trans[option.message],
      type: "warning",
      confirmKey: option.confirmKey,
    })
  }


  async showMessageBox(options: MyMessageBoxOption): Promise<MyMessageBoxResponse> {

    const dialogRef = this.dialog.open(MyMessageBox, {
      data: options,
      disableClose: options.disableClose,
      minWidth: 350,
    });

    return await firstValueFrom<MyMessageBoxResponse>(dialogRef.afterClosed());
  }

  async showToast(options: MyToastOption) {
    const config: MatSnackBarConfig = options;
    config.panelClass = ['my-toast'];
    if (options.color) {
      config.panelClass.push(`my-toast-${options.color}`);
    }
    const trans = await firstValueFrom(this.translateService.get([options.message]))

    const message = trans[options.message];
    config.duration = options.duration || 2000;
    this.toast.open(message, options.actionText, config)
  }

  async showLoading() {
    const options: MyMessageBoxOption = { message: "", type: 'loading' };

    this.loadingDialogRef = this.dialog.open(MyMessageBox, {
      data: options,
      disableClose: true,
      minWidth: 200,
    });

  }
  async dismissLoading() {
    await this.loadingDialogRef?.close();
    this.loadingDialogRef = undefined;
  }

}

export interface MyMessageBoxOption {
  title?: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error' | 'question' | 'loading';
  closeButton?: boolean;
  button?: 'YesNo' | 'YesNoCancel' | 'OkOnly' | "OkCancel";
  onClick?: any;
  disableClose?: boolean;
  confirmKey?: string;
}


export type MyColor = "success" | "primary" | "secondary" | "warning" | "danger" | "dark" | "light" | "info";

export enum MyMessageBoxResponse {
  confirm = 1, reject = 2, cancel = 3
}

export interface MyToastOption extends MatSnackBarConfig {
  message: string;
  color?: MyColor;
  actionText?: string;
}