import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { APP_PARAMS } from '../@interfaces/const';

@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(private translateService:TranslateService,private title:Title) { }

  async init() {
    this.title.setTitle(APP_PARAMS.appName)
    // this.authService.checkLogin();
    // const user = this.baseService.getLoggedInUser();
    const lang ='en' // user?.usedLanguage || this.storageService.get(StorageKey.CURRENT_LANGUAGE) || this.translateService.getBrowserLang() || 'en';
    this.translateService.setDefaultLang(lang);
    this.translateService.use(lang);
    // this.storageService.set(StorageKey.CURRENT_LANGUAGE, lang);
  }
}
