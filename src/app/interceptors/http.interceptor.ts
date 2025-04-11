import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';
import { catchError, firstValueFrom, from, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export class httpInterceptor implements HttpInterceptor {
  constructor(private router: Router, private api: ApiService, private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.request(req, next)) as any;

  }

  private async request(req: HttpRequest<any>, next: HttpHandler) {
    req = await this.addTokensAndParams(req);
    const result: any = next.handle(req).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status == 401) {
            return from(this.handle401(req, next));
          }
        }
        return throwError(() => err);
      })
    )
    return firstValueFrom(result);

  }


  private async addTokensAndParams(req: HttpRequest<any>) {

    req = req.clone({ setHeaders: { 'api-token': environment.apiToken } });

    if (req.headers.get("Authorization")) {
      req = req.clone({ setHeaders: { "Authorization": `Bearer ${this.authService.getToken()}` } });
    }

    const user = this.authService.getLoginUser();

    if (req.method != 'DELETE' && !req.params.get("language")) {
      req = req.clone({ setParams: { "language": user?.language || 'en' } });
    }

    if (user?.isSystemAdmin) {
      req = req.clone({ setParams: { "sys": this.authService.getSelectedSysAcct() || '' } });
      req = req.clone({ setParams: { "com": this.authService.getSelectedCompany() || '' } });
    }
    return req;
  }

  private async handle401(req: HttpRequest<any>, next: HttpHandler) {
    const newTokens = await this.authService.getNewTokens();
    const refreshToken = newTokens.refreshToken;
    if (!refreshToken) {
      console.log('failed to get refresh token');
      this.authService.logout(true);
      return;
    }


    req = req.clone({ setHeaders: { 'Authorization': `Bearer ${newTokens.token}` } });
    console.log('proceed with new tokens');

    return firstValueFrom(next.handle(req).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status == 401) {
            this.authService.logout(true);
            return throwError(() => err);
          }
        }
        return throwError(() => err);
      }))
    )
  }
}

