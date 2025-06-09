import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {


  constructor(private http: HttpClient) { }

  readonly apiUrl = environment.apiUrl;


  ///////////Document Document Type aand Workspace////////////

  getConfig<T>(type: 'workspace' | 'workspace-nav' | 'datagrid' | 'form', docType: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.apiUrl}/admin/config/${type}/${docType}`));
  }

  getDocuments<T>(docType: string, filter: any[]): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.apiUrl}/admin/document/${docType}`));
  }

  getDocumentByField<T>(docType: string, field: string, value: any): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.apiUrl}/admin/document/${docType}/${field}/${value}`));
  }

  createDocument<T>(docType: string, body: any): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.apiUrl}/admin/document/${docType}`, body));
  }

  updateDocumentByField<T>(docType: string, field: string, value: any, body: any): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${this.apiUrl}/admin/document/${docType}/${field}/${value}`, body));
  }

  getDocumentType<T>(docType: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.apiUrl}/admin/document/type/${docType}`));
  }

  runEventScript<T>(docType: string, body: any): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.apiUrl}/admin/document/event/${docType}`, body));
  } 

  /////////////////////// User ////////////////////////
  login<T>(body: { loginId: string, password: string }): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.apiUrl}/admin/login`, body));
  }

  getNewToken<T = any>(refreshToken:string):Promise<T> {
    let headers = { headers: { 'Authorization': `Bearer ${refreshToken}`  } };
    let requestURL = this.apiUrl + '/auth/refresh_token';
    return firstValueFrom(this.http.get<T>(requestURL, headers).pipe());
  }

}

