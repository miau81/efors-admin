import { Router } from 'express';
import type { Request } from 'express';
import { ConnectionAction } from './api.db.interface';

export interface Route {
  path?: string
  router: Router
}

export interface SRequest extends Request {
  requestId?: string;
  user?: any;
  language?: string;
  sys?:string;
  com?:string;
  fromApp?:string;
  mysqlConn?:ConnectionAction;
  isSelf?:boolean;
}
