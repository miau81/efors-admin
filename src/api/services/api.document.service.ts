import { myErpFields } from "../../app/@interfaces/const";
import { MyERPDocType } from "../../app/@interfaces/interface";
import db from "../databases";
import { NoDataException } from "../exceptions/NoDataException";
import { ServiceException } from "../exceptions/ServiceException";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { GetDataOption } from "../interfaces/api.entity.interface";
import { AuthURL } from "../interfaces/api.enum";
import { ApiParam } from "../interfaces/api.main.interface";
import { ConvertUtil } from "../utils/convert";
import { logger } from "../utils/logger";
import { EntityService } from "./entity.service";
import { JWTService } from "./jwt.service";



export class ApiDocumentService {

    private convertUtil = new ConvertUtil();
    private entityService = new EntityService();
    private jswService = new JWTService();

    async getDocumentType(docType: string) {
        return this.entityService.getDocumentType(docType);
    }

    async getDocuments(params: ApiParam, mysqlConn: ConnectionAction) {
        try {
            const imp = await this.entityService.importDocTypeFile(params.tableName);

            if (imp.beforeGetList) {
                imp.beforeGetList(params, mysqlConn);
            }

            const value = this.convertUtil.convertToDataTypeValue(params.byValue);
            const where = params.customWhereQuery || await this.populateWhareQuery(params);

            let orderBy = "";
            let sortField = params.sorting?.sortField;
            if (sortField) {
                if (sortField == "id") {
                    sortField = "t.id";
                }
                orderBy = `ORDER BY ${sortField} ${params.sorting?.sortBy}`;
            }

            const pagination = `LIMIT ${params.pagination?.limit} OFFSET ${params.pagination?.start}`;

            const selfWhere = await this.entityService.selfOnlyFilter(params.tableName, params.authURL, where, mysqlConn, params.user?.id);

            const totalRecord: number = await this.entityService.countData(params.tableName, selfWhere, mysqlConn);

            const options: GetDataOption = {
                tableName: params.tableName,
                selectFields: params.selectFields,
                excludeFields: params.excludeFields,
                sqlWhere: where,
                sqlOrderBy: orderBy,
                sqlLimit: pagination,
                authURL: params.authURL,
                language: params.language,
                user: params.user,
                mysqlConn: mysqlConn,
                getChild: params.getChild,
                getParent: params.getParent
            };

            let data = await this.entityService.getData(options);

            if (imp.afterGetList) {
                data = imp.afterGetList(params, data?.[0], mysqlConn);
            }

            const limit = this.convertUtil.convertToDataTypeValue(params.pagination?.limit);
            const page = Math.ceil((this.convertUtil.convertToDataTypeValue(params.pagination?.start) + 1) / limit);
            const totalPage = Math.ceil(totalRecord / limit);
            const result = {
                currentPage: page,
                totalPage: totalPage,
                totalRecord: totalRecord,
                records: data
            };
            return result;
        } catch (error) {
            logger.error('Error loading document type:', error);
            throw new ServiceException(`Error loading document type [${params.tableName}]`);
        }
    }

    async getDocument(params: ApiParam, mysqlConn: ConnectionAction) {

        try {
            const imp = await this.entityService.importDocTypeFile(params.tableName);

            if (imp.beforeGet) {
                imp.beforeGet(params, mysqlConn);
            }

            const value = this.convertUtil.convertToDataTypeValue(params.byValue);
            const where = params.customWhereQuery || `WHERE ${params.byField} = ${value}`;

            const option: GetDataOption = {
                mysqlConn: mysqlConn,
                tableName: params.tableName,
                selectFields: params.selectFields,
                excludeFields: params.excludeFields,
                authURL: params.authURL,
                language: params.language,
                sys: params.sys,
                com: params.com,
                sqlWhere: where,
                user: params.user,
                getChild: params.getChild,
                getParent: params.getParent
            }
            let data: any = await this.entityService.getData(option);
            if (!data || data?.length == 0) {
                throw new NoDataException(`Not data found with [${params.byField}]: ${params.byValue}`);
            }
            data = data[0];
            if (imp.afterGet) {
                data = imp.afterGet(params, data?.[0], mysqlConn);
            }
            return data;
        } catch (error) {
            logger.error('Error loading document type:', error);
            throw new ServiceException(`Error loading document type [${params.tableName}]`);
        }
    }

    async create(params: ApiParam, mysqlConn: ConnectionAction) {
        try {
            let body = params.requestBody;
            delete body["id"];

            const imp = await this.entityService.importDocTypeFile(params.tableName);
            if (imp.beforeCreate) {
                body = await imp.beforeCreate(params, mysqlConn);
            }

            const f: string[] = await this.entityService.getTableFields(params.tableName, mysqlConn,true) as string[];
            await this.entityService.validateUpdateFields(params.tableName, body, mysqlConn);


            if (imp.afterValidation) {
                body = await imp.afterValidation(params, mysqlConn);
            }

            if (f.includes("createdBy")) {
                body.createdBy = params.user?.id;
            }
            if (f.includes("lastModifiedBy")) {
                body.lastModifiedBy = params.user?.id;
            }
            if (f.includes("userId") && params.authURL == AuthURL.AUTH) {
                body.userId = params.user?.id;
            }
            //TODO
            if (f.includes("copmayId")) {
                body.copmayId = false;
            }
            if (f.includes("sysAcct")) {
                body.systemAcctId = false;
            }


            const id = await this.entityService.save(params.tableName, params.requestBody, mysqlConn);
            body = { id: id, ...body };

            //ToDO: create child

            if (imp.afterCreate) {
                body = await imp.afterCreate(params, mysqlConn);
            }

            return body;
        } catch (error) {
            logger.error('Error creating document type:', error);
            throw new ServiceException(`Error creating document type [${params.tableName}]`);
        }
    }

    async update(params: ApiParam, mysqlConn: ConnectionAction) {
        try {

            let body = params.requestBody;
            let updateString: string[] = [];
            let notUpdatedable: string[] = [];

            const byValue = this.convertUtil.convertToDataTypeValue(params.byValue);
            const where = `WHERE ${params.byField} =${byValue}`;

            const docType: MyERPDocType = await this.getDocumentType(params.tableName);

            const exists = await this.entityService.checkExists(params.tableName, where, mysqlConn);
            if (!exists.exists) {
                throw new NoDataException(`Data not found with [${params.byField}]: ${params.byValue}`);
            }

            const imp = await this.entityService.importDocTypeFile(params.tableName);
            if (imp.beforeUpdate) {
                body = await imp.beforeUpdate(params, mysqlConn);
            }

            await this.entityService.validateUpdateFields(params.tableName, body, mysqlConn);

            if (imp.afterValidation) {
                body = await imp.afterValidation(params, mysqlConn);
            }
            const id = body.id;
            delete body.createdDate;
            delete body.createdBy;
            delete body.userId;
            delete body.copmayId;
            delete body.docStatus;
            delete body.isDeleted;
            delete body.sysAcct;

            if (docType.fields.find(f => f.id == "lastModifiedBy")) {
                body.lastModifiedBy = params.user?.id || 'SYSTEM';
            }

            //Hash if is Password
            for (const field of docType.fields.filter(f => f.isPassword)) {
                if (body[field.id]) {
                    body[field.id] = await this.jswService.hashPassword(body[field.id]);
                } else {
                    delete body[field.id];
                }
            }

            //Remove notupdateble field
            notUpdatedable = docType.fields.filter(f => f.isReadOnly).map(f => f.id);
            // const whereTable = `WHERE tableName='${params.tableName}'`

            // const tableConfig = await mysqlConn.querySingle(`SELECT notUpdateField FROM ${db}.table_config WHERE ${whereTable}`);
            // if (tableConfig?.notUpdateField) {
            //     notUpdatedable = tableConfig?.notUpdateField?.split(",");
            // }

            //update 
            Object.keys(body).forEach(b => {
                if (!notUpdatedable.includes(b)) {
                    let value = this.convertUtil.convertToDataTypeValue(body[b]);
                    let str = `${b} = ${value}`;
                    updateString.push(str);
                } else {
                    delete params.requestBody[b];
                }
            });

            await this.entityService.update(params.tableName, updateString.toString(), where, mysqlConn);

            // await this.entityService.save(params.tableName, params.requestBody, mysqlConn);

            if (imp.afterUpdate) {
                body = await imp.afterUpdate(params, mysqlConn);
            }

            return body;
        } catch (error) {
            console.log(error)
            logger.error('Error updating document type:', error);
            throw new ServiceException(`Error updating document type [${params.tableName}]`);
        }
    }

    async populateWhareQuery(params: ApiParam) {
        let strWhere: string[] = [];
        let strSearch: string[] = [];
        if (params.search?.searchFields && params.search?.searchValue) {
            const searchFields: string[] = params.search?.searchFields?.split(",");
            for (let f of searchFields) {
                strSearch.push(`${f} like '%${params.search?.searchValue}%'`);
            }
            let search = `(${strSearch.join(" OR ")})`;
            strWhere.push(search);
        }

        for (let f of params.filters || []) {
            strWhere.push(await this.convertUtil.convertFilterString(f, params.tableName));
        }

        let where = "";
        if (strWhere.length > 0) {
            where = `WHERE ${strWhere.join(" AND ")}`;
        }

        return where;
    }

    async checkExist(tableName: string, fieldName: string, value: any, mysqlConn: ConnectionAction): Promise<any> {
        value = this.convertUtil.convertToDataTypeValue(value);
        return await this.entityService.checkExists(tableName, `WHERE ${fieldName}=${value}`, mysqlConn);

    }

}