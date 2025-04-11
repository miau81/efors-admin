
import { ApiRequestMethod, AuthURL,  OperatorEnum, OrderBy } from "./api.enum"
import { Express } from 'express';
import { Multer } from 'multer';
export interface ApiParam{
    user:any;
    language?:string;
    tableName: string;
    byField?: string;
    byValue?: any;
    selectFields?:string[];
    excludeFields?: string[];
    sys?:string;
    com?:string;
    pagination?: {
        start: number;
        limit: number;
    };
    sorting?:{
        sortField?: string;
        sortBy?: OrderBy;
    };
    search?: {
        searchFields?: string;
        searchValue?: string;
    };
    filters?: Filter[];
    customWhereQuery?: string;
    requestBody?:any;
    method: ApiRequestMethod;
    authURL?: AuthURL;
    getChild?:boolean;
    getParent?:boolean;
    queryParam?:any;
    files?:Express.Multer.File[];
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

export interface PaginationListOption{
    selectedfields:string;
    selectedFrom:string;
    where?:string;
    groupBy?:string;
    orderBy?:string;
    start?:number;
    limit?:number;
}

export interface FileUpladConfig{
    files:any;
    limit:number;
    fileType:string;
    savePath:string;
    overwrite?:boolean;
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
