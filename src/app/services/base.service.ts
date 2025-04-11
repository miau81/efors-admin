import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MyERPField } from '../@interfaces/interface';
import { MyCoreService } from 'myerp-core';


@Injectable({
  providedIn: 'root'
})
export class BaseService {


  constructor(private router: Router, private myCoreService: MyCoreService) { }

  async navigateTo(url: string, extras?: NavigationExtras) {
    return await this.router.navigate([url], extras);
  }

  subscribeParam(route: ActivatedRoute, callback: Function) {
    route.paramMap.subscribe(p => {
      const params = {
        ...p.keys.reduce((acc, key) => ({ ...acc, [key]: p.get(key) }), {})
      }
      console.log(params)
      callback(params)
    })

  }

  sortDocumentFields(fileds: MyERPField[]) {
    return fileds.sort((a, b) => (a.sorting || 0) - (b.sorting || 0));
  }

  showErrorMessage(error: any) {
    return this.myCoreService.showAlertMessage({ title: "_ERROR", message: error?.error?.mesage || error.message || error, type: "error" });
  }

  showWarningMessage(message: string) {
    return this.myCoreService.showAlertMessage({ title: "_WARNING", message: message, type: "warning" });
  }

  showSuccessMessage(message: string) {
    return this.myCoreService.showAlertMessage({ title: "_SUCCESS", message: message, type: "success" });
  }

  showSuccessToast(message: string) {
    return this.myCoreService.showToast({ message: message, color: "success" });
  }

}
