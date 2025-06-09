
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService {

  readonly apiUrl = environment.apiUrl;
  constructor() {

  }

  /////////////////////// User ////////////////////////
  login<T>(body: { loginId: string, password: string }) {
    return  // firstValueFrom(this.http.post<T>(`${this.apiUrl}/admin/login`, body));
  }

  getNewToken<T = any>(refreshToken: string) {
    let headers = { headers: { 'Authorization': `Bearer ${refreshToken}` } };
    let requestURL = environment.apiToken + '/admin/refresh_token';
    return  // firstValueFrom(this.http.get<T>(requestURL, headers).pipe());
  }

}
