import { MyERPDocType } from "../../app/@interfaces/interface";
import { ConnectionAction } from "./api.db.interface";
import { AuthURL } from "./api.enum";

export interface GetDataOption {
    mysqlConn: ConnectionAction;
    tableName: string;
    authURL?: AuthURL;
    selectFields?: string[];
    excludeFields?: string[];
    sqlWhere?: string;
    sqlOrderBy?: string;
    sqlLimit?: string;
    language?: string;
    sys?:string;
    com?:string;
    user?: any;
    getChild?:boolean;
    getParent?:boolean;
    includeDeleted?:boolean;

}


