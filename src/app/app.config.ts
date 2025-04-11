import { ApplicationConfig, importProvidersFrom, inject, PLATFORM_ID, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { isPlatformServer } from '@angular/common';
import { provideHttpClient, HttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { environment } from '../environments/environment';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { AppInitService } from './services/app-init.service';
import { SERVER_HOST } from './app.tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    importProvidersFrom(TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient, PLATFORM_ID]
      }
    })),
    // { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: SERVER_HOST, useValue: "./" },
    provideAppInitializer(() => {
      const initializerFn = (InitializeApp)(inject(AppInitService));
      return initializerFn();
    }),
  ]
};

function InitializeApp(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.init();
  }
}

function HttpLoaderFactory(http: HttpClient, platformId: Object) {
  const isServer = isPlatformServer(platformId);
  const prefix = isServer && environment.baseHref ? `${environment.host}/assets/i18n/` : './assets/i18n/';
  return new TranslateHttpLoader(http, prefix, '.json');
}
