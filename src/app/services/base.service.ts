import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MyERPField, MyERPFieldGroup } from '../@interfaces/interface';
import { MyMessageBoxService } from '@myerp/services';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';




@Injectable({
  providedIn: 'root'
})
export class BaseService {


  constructor(
    private router: Router,
    private myMessageBoxService: MyMessageBoxService,
    private translateService: TranslateService) { }

  async navigateTo(url: string, extras?: NavigationExtras) {
    return await this.router.navigate([url], extras);
  }

  async refreshRoute(url?:string) {
  const currentUrl = url || this.router.url;
  await this.router.navigateByUrl('/', { skipLocationChange: true })
    this.router.navigate([currentUrl]);

}


  subscribeParam(route: ActivatedRoute, callback: Function) {
    route.paramMap.subscribe(p => {
      const params = {
        ...p.keys.reduce((acc, key) => ({ ...acc, [key]: p.get(key) }), {})
      }
      callback(params)
    })

  }

  sortDocumentFields(fileds: MyERPField[]) {
    return fileds.sort((a, b) => (a.sorting || 0) - (b.sorting || 0));
  }

  sortDocumentFieldGroups(fileds: MyERPFieldGroup[]) {
    return fileds.sort((a, b) => (a.sorting || 0) - (b.sorting || 0));
  }

  showErrorMessage(error: any) {
    const errorMessage = error?.error?.message || error.error?.error || error.message || error
    return this.myMessageBoxService.showAlertMessage({ title: "_ERROR", message: errorMessage, type: "error" });
  }

  showConfirm(message: string) {
    return this.myMessageBoxService.showConfirmMessage({ title: "_CONFIRM", message: message });
  }

  showInputConfirm(message: string, confirmKey: string) {
    return this.myMessageBoxService.showInputConfirmMessage({ title: "_CONFIRM", message: message, confirmKey: confirmKey });
  }

  showWarningMessage(message: string) {
    return this.myMessageBoxService.showAlertMessage({ title: "_WARNING", message: message, type: "warning" });
  }

  showSuccessMessage(message: string) {
    return this.myMessageBoxService.showAlertMessage({ title: "_SUCCESS", message: message, type: "success" });
  }

  showSuccessToast(message: string) {
    return this.myMessageBoxService.showToast({ message: message, color: "success" });
  }

  async getTranslate(key: string | string[], interpolateParams?: any) {
    return await firstValueFrom(this.translateService.get(key, interpolateParams));
  }

  async showLoading(){
    return this.myMessageBoxService.showLoading();
  }

  async dismissLoading(){
    return this.myMessageBoxService.dismissLoading();
  }

}
