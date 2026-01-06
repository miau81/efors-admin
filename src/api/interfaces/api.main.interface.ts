
import { MyERPDocType } from "@myerp/interfaces/interface";
import { ConnectionAction } from "./api.db.interface";


export interface ApiParam {
    user: any;
    language?: string;
    document: string;
    sys?: string;
    com?: string;
    queryParam?: any;
    params?: any;
    body?: any;

}
export interface FileUpladConfig {
    files: any;
    limit: number;
    fileType: string;
    savePath: string;
    overwrite?: boolean;
}

export interface DBOption {
    filter?: DBFilter
    sort?: string;
    limit?: number;
    offset?: number;
    search?: string;
    searchFields?: string[];
    fields?: string[];
    excludeFields?: string[];
    getChild?: boolean;
    getLink?: boolean;
    pagination?: boolean;
    customSql?: string;
}

export type DBFilterOperator = "and" | "or";
export interface DBFilterCondition {
    field: string;
    operator?: '=' | 'in' | '<' | '<=' | '>' | '>=' | 'between' | '!=' | 'like' | 'is' | 'is not';
    value: any;
}
export type DBFilter = (DBFilterCondition | DBFilterOperator | DBFilter)[]



export interface GetDataOption {
    mysqlConn: ConnectionAction;
    document: string;
    docType: MyERPDocType;
    selectFields?: string[];
    excludeFields?: string[];
    language?: string;
    sys?: string;
    com?: string;
    user?: any;
    getChild?: boolean;
    getLink?: boolean;
    includeDeleted?: boolean;
    filter?: DBFilter;
    sort?: string;
    limit?: number;
    offset?: number;
    search?: string;
    searchFields?: string[];
    pagination?: boolean;
    customSql?: string;
}
