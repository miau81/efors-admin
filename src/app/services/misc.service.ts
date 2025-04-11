import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MiscService {
  constructor() {}

  getFullUrl(url: string): string {
    if (!url || url.startsWith('./assets')) {
      return url;
    }
    if (!url.includes('http')) {
      url = environment.apiUrl + url;
    }
    return url;
  }

  convertFileToDataUrl(file: any): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (file) {
        let reader = new FileReader();
        reader.onload = (event: any) => {
          resolve(event.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // export function getFullAddress(address: Address) {
  //     const add = [address.address, address.postcode, address.city, address.state, address.country];
  //     return add.filter(f => f).join(", ");
  // }

  // export function getFullName(name: FullName) {
  //     const names = [
  //         name.fullNameEn || [name.familyNameEn, name.nameEn].filter(f => f).join(' '),
  //         name.fullNameZh || [name.familyNameZh, name.nameZh].filter(f => f).join(''),
  //     ]
  //     return names.filter(f => f).join(' ');
  // }

  strToBase64(str: string | number): string {
    const utf8Encoder = new TextEncoder();
    const byteArray = utf8Encoder.encode(String(str));
    let binaryString = '';
    byteArray.forEach((byte) => {
      binaryString += String.fromCharCode(byte);
    });
    return btoa(binaryString);
  }

  base64ToStr(base64: string): string {
    const binaryString = atob(base64);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    const utf8Decoder = new TextDecoder();
    return utf8Decoder.decode(byteArray);
  }

  isClassOf<T>(obj: any, keyToCheck: string): obj is T {
    return obj && typeof obj == 'object' && keyToCheck in obj;
  }
  
}
