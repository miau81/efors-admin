import { Injectable } from '@nestjs/common';
import { ApiUserService } from './api.user.service';
import { ApiSysAcctService } from './api.sys-acct.service';

@Injectable()
export class UserAccessService {
  constructor(
    private userService: ApiUserService,
    private sysAcctService: ApiSysAcctService,
  ) {}

  async canAccessSysAcct(userId: string, sysAcctId: string): Promise<boolean> {
    const user = await this.userService.findById(userId);
    if (!user) return false;

    // Super Admin can access everything
if (user.userType === 'Super Admin') return true;

    // System Admin can access all sys_accts
if (user.userType === 'System Admin') return true;

    // System User can only access assigned sys_accts
if (user.userType === 'System User') {
      return user.sysAccts?.some(sa => sa.id === sysAcctId) || false;
    }

    return false;
  }

  async canAccessAllSysAccts(userId: string): Promise<boolean> {
    const user = await this.userService.findById(userId);
    if (!user) return false;

    // Super Admin and System Admin can access all sys_accts
    return user.userType === 'Super Admin' || user.userType === 'System Admin';
  }

  async getAccessibleSysAccts(userId: string): Promise<string[]> {
    const user = await this.userService.findById(userId);
    if (!user) return [];

    // Super Admin and System Admin can access all sys_accts
if (user.userType === 'Super Admin' || user.userType === 'System Admin') {
      const allSysAccts = await this.sysAcctService.findAll();
      return allSysAccts.map(sa => sa.id);
    }

    // System User can only access assigned sys_accts
return user.sysAccts?.map(sa => sa.id) || [];
  }
}