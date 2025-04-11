import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(@Inject(PLATFORM_ID) private platformID: Object) { }

  get<T = string>(key: StorageKey) {
    if (isPlatformBrowser(this.platformID)) {
      const value: any = localStorage.getItem(key);
      let _value: T = this.isJsonString(value) ? JSON.parse(value) : value;
      return _value;
    }
    return;
  }

  set<T = string>(key: StorageKey, value: any) {
    if (isPlatformBrowser(this.platformID)) {
      const _value: string = typeof value != "string" ? JSON.stringify(value) : value;
      return localStorage.setItem(key, _value);
    }
  }

  remove(key: StorageKey) {
    if (isPlatformBrowser(this.platformID)) {
      return localStorage.removeItem(key);
    }
  }

  clearAll() {
    localStorage.clear();
  }

  isJsonString(value: string) {
    try {
      JSON.parse(value);
      return true;
    } catch (err) {
      return false;
    }
  }

}


export enum StorageKey {
  TOKEN = "MYERP_TOKEN",
  REFRESH_TOKEN = "MYERP__REFRESH_TOKEN",
  USER = "MYERP_USER",
  CURRENT_LANGUAGE = "MYERP_CURRENT_LANGUAGE",
  SELECTED_SYS_ACCT = "MYERP_SELECTED_SYS_ACCT",
  SELECTED_COMPANY = "MYERP_SELECTED_COMPANY",
}
