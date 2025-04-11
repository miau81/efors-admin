import { Injectable } from '@angular/core';
import { StorageKey, StorageService } from './storage.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from './api.service';
import { BaseService } from './base.service';
import { User } from '../@interfaces/document.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // public isLogin: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private storageService: StorageService,
    // private router: Router,
    private baseService: BaseService,
    private api: ApiService
  ) { }

  async logout(silent: boolean = true) {
    if (!silent) {
      // const res = await this.baseService.showMessageBox({ message: "_CONFIRM_LOGOUT", title: "_LOGOUT", button: "YesNo", type: "question" });
      // if (res == "NO") {
      //   return
      // }
    }
    this.storageService.clearAll();
    // this.baseService.user = undefined;
    if (!silent) {
      // this.baseService.showToast({ message: "_BYE", color: "primary" });
    }
    this.baseService.navigateTo('/login', { replaceUrl: true });
  }

  async login(body: { loginId: string, password: string }): Promise<any> {
    try {
      const res: any = await this.api.login(body);
      this.storageService.set(StorageKey.TOKEN, res.token);
      this.storageService.set(StorageKey.REFRESH_TOKEN, res.token);
      this.storageService.set(StorageKey.USER, res.user);
      this.baseService.navigateTo('', { replaceUrl: true });

    } catch (error: any) {
      throw new HttpErrorResponse(error);
    }
  }

  checkLogin(fromAuthGuard: boolean = false) {
    const user = this.getLoginUser();
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();
    if (!user || !token || !refreshToken) {
      if (!fromAuthGuard) {
        this.logout();
      }
      return false;
    }
    return true;
  }

  getLoginUser() {
    return this.storageService.get<User>(StorageKey.USER);
  }

  getToken() {
    return this.storageService.get<string>(StorageKey.TOKEN);
  }

  getRefreshToken() {
    return this.storageService.get<string>(StorageKey.REFRESH_TOKEN);
  }

  getSelectedSysAcct() {
    return this.storageService.get<string>(StorageKey.REFRESH_TOKEN);
  }

  getSelectedCompany() {
    return this.storageService.get<string>(StorageKey.REFRESH_TOKEN);
  }

  async getNewTokens() {
    const newTokens = await this.api.getNewToken(this.getRefreshToken() || '');
    this.storageService.set(StorageKey.TOKEN, newTokens.token);
    this.storageService.set(StorageKey.REFRESH_TOKEN, newTokens.refreshToken);
    return newTokens;
  }




}
