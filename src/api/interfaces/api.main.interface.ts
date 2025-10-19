
import { ApiRequestMethod, AuthURL, OperatorEnum, OrderBy } from "./api.enum"
export interface ApiParam {
    user: any;
    language?: string;
    tableName: string;
    sys?: string;
    com?: string;
    method: ApiRequestMethod;
    authURL?: AuthURL;
    queryParam?: any;
    params?: any;
    body?: any;

}

export interface ApiSaveParam extends ApiParam {
    files?: Express.Multer.File[];
}

export interface ApiGetParam extends ApiParam {
    selectFields?: string[];
    excludeFields?: string[];
    pagination?: {
        start: number;
        limit: number;
    };
    sorting?: {
        sortField?: string;
        sortBy?: OrderBy;
    };
    search?: {
        searchFields?: string;
        searchValue?: string;
    };
    filters?: Filter[];
    customWhereQuery?: string;
    getChild?: boolean;
    getParent?: boolean;
    listOnly?: boolean;

}

export interface Filter {
    field: string;
    value: any;
    operator: OperatorEnum;
    type: FilterType;

}

export enum FilterType {
    text = "text",
    date = "date",
    datetime = "datetime",
    month = "month",
    year = "year"
}

export interface PaginationListOption {
    selectedfields: string;
    selectedFrom: string;
    where?: string;
    groupBy?: string;
    orderBy?: string;
    start?: number;
    limit?: number;
}

export interface FileUpladConfig {
    files: any;
    limit: number;
    fileType: string;
    savePath: string;
    overwrite?: boolean;
}


// export interface Notification{
//     id?:number
//     createdDate:Date
//     senderId:number,
//     userId:number,
//     senderType:"PERSONAL" | "PAGE" | "STUDYWITH"
//     messageObject:string,
//     messageType:NotificationMessageType
//     notificationFor:"POST" | "KNOWLEDGE_BASE" | "SHOP" | "VIDEO"
//     type:"INFO" | "FRIEND_REQUEST"
//     isRead:boolean
//     isViewed:boolean
// }
