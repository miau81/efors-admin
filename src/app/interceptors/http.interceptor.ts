import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';

import { catchError, firstValueFrom, from, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';

@Injectable()
export class httpInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.request(req, next)) as any;

  }

  private request(req: HttpRequest<any>, next: HttpHandler) {
    req= this.addTokensAndParams(req);
    const result = next.handle(req).pipe(
      catchError((err) => {
        console.log("req",err.status, req.url)
        if (err instanceof HttpErrorResponse) {
          if (err.status == 401 && !req.url.includes('/login')) {
            return this.handle401(req, next);
          }
        }
        return throwError(() => err);
      })
    )
    return result;

  }


  private addTokensAndParams(req: HttpRequest<any>) {


    req = req.clone({ setHeaders: { 'api-token': environment.apiToken } });

    if (!req.headers.get("Authorization")) {
      req = req.clone({ setHeaders: { "Authorization": `Bearer ${this.authService.getToken()}` } });
    }

    const user = this.authService.getLoginUser();

    if (req.method != 'DELETE' && !req.params.get("language")) {
      req = req.clone({ setParams: { "language": user?.language || 'en' } });
    }

    if (user?.isSystemAdmin) {
      const selectedSys = this.authService.getSelectedSysAcct()
      if (selectedSys) {
        req = req.clone({ setParams: { "sys": selectedSys } });
      }
      const selectedCom = this.authService.getSelectedCompany();
      if (selectedCom) {
        req = req.clone({ setParams: { "com": selectedCom } });
      }
    }
    return req;
  }

  private handle401(req: HttpRequest<any>, next: HttpHandler) {
    return from(this.authService.getNewTokens()).pipe(
      catchError((err) => {
        this.authService.logout(true);
        return throwError(() => err);
      }),
      switchMap(newTokens => {
        const refreshToken = newTokens?.refreshToken;
        if (!refreshToken) {
          console.log('failed to get refresh token');
          this.authService.logout(true);
          return throwError(() => new Error('No refresh token'));
        }

        req = req.clone({ setHeaders: { 'Authorization': `Bearer ${newTokens?.token}` } });

        return next.handle(req).pipe(
          catchError((err) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status == 401) {
                this.authService.logout(true);
              }
            }
            return throwError(() => err);
          }))
      })
    )

  }
}

