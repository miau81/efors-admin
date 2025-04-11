import { MyERPDocument } from "./interface";

export interface User extends MyERPDocument {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    language: string;
    isSuperAdmin: boolean;
    lastLoginOn: Date;
    isSystemAdmin: boolean;
}