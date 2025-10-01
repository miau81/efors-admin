import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, switchMap, Observable, throwError, take, filter } from 'rxjs'; // Added 'filter' for BehaviorSubject
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from } from 'rxjs'; // Import 'from' and BehaviorSubject

@Injectable()
export class httpInterceptor implements HttpInterceptor {
  private isRefreshingToken = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = this.addTokensAndParams(req);

    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        console.log("Interceptor Error:", err.status, req.url);

        if (req.url.includes('/auth/refresh_token')) {
          return throwError(() => err);
        }

        // Check if 401 and not the login endpoint itself
        if (err.status === 401 && !req.url.includes('/login')) {
          return this.handle401Error(req, next);
        }

        // For all other errors, just re-throw
        return throwError(() => err);
      })
    );
  }

  private addTokensAndParams(req: HttpRequest<any>): HttpRequest<any> {
    req = req.clone({ setHeaders: { 'api-token': environment.apiToken } });

    if (!req.headers.has("Authorization")) {
      const token = this.authService.getToken();
      if (token) {
        req = req.clone({ setHeaders: { "Authorization": `Bearer ${token}` } });
      }
    }

    const user = this.authService.getLoginUser();

    if (req.method && req.method !== 'DELETE' && !req.params.get("language")) {
      req = req.clone({ setParams: { "language": user?.language || 'en' } });
    }

    if (user?.isSystemAdmin) {
      const selectedSys = this.authService.getSelectedSysAcct();
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

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      this.refreshTokenSubject.next(null); // Clear previous token state

      // **Adjustment for getNewTokens() returning a Promise**
      // Use 'from' to convert the Promise into an Observable
      return from(this.authService.getNewTokens()).pipe(
        switchMap((newTokens: { token: string; refreshToken: string } | null) => {
          this.isRefreshingToken = false;
          console.log("newTokens", newTokens)
          if (newTokens?.token) {
            this.refreshTokenSubject.next(newTokens.token); // Store the new token
            // Re-clone the original request with the new token
            return next.handle(this.addAuthorizationHeader(req, newTokens.token));
          } else {
            console.warn('Failed to get new tokens or token is null. Logging out.');
            this.authService.logout(true);
            // Throw a proper HttpErrorResponse for better downstream handling
            return throwError(() => new HttpErrorResponse({ status: 401, statusText: 'Unauthorized', error: 'Failed to refresh token' }));
          }
        }),
        catchError((err) => {
          this.isRefreshingToken = false;
          this.authService.logout(true); // Logout on refresh token failure
          return throwError(() => err); // Re-throw the error
        })
      );
    } else {
      // If a refresh token request is already in progress,
      // queue the original request until the new token is available
      return this.refreshTokenSubject.pipe(
        filter(token => token != null), // Wait until token is available
        take(1), // Take only the first emitted token
        switchMap(token => {
          return next.handle(this.addAuthorizationHeader(req, token));
        })
      );
    }
  }

  // Helper to add Authorization header to a request
  private addAuthorizationHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}