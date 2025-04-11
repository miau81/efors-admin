import { Router } from 'express';
import type { Request } from 'express';
import { AuthURL } from './api.enum';
// import type { AuthURL } from './enum';


export interface Route {
  path?: string
  router: Router
}

export interface SRequest extends Request {
  authUser?: any;
  language?: string;
  isAdmin?: boolean;
  authURL?: AuthURL;
  sys?:string;
  com?:string;
}

// export type AuthURL = "admin" | "auth" | "public";