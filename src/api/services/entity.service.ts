
import { table } from "console";
import { BadRequestException } from "../exceptions/BadRequestException";
import { ServiceException } from "../exceptions/ServiceException";
import type { ConnectionAction } from "../interfaces/api.db.interface";
import type { GetDataOption } from "../interfaces/api.entity.interface";
import { AuthURL } from "../interfaces/api.enum";
import { PaginationListOption } from "../interfaces/api.main.interface";
import { logger } from "../utils/logger";
import { dbName } from "./api.database-service";
import { MyERPDocType, MyERPField } from "../../app/@interfaces/interface";


const db = dbName;

export class EntityService {

    async getData(options: GetDataOption): Promise<any> {
        options.sqlWhere = await this.selfOnlyFilter(options.tableName, options.authURL, options.sqlWhere, options.mysqlConn, options.user?.id);
        if (!options.includeDeleted) {
            options.sqlWhere = await this.filterDeleted(options.tableName, options.sqlWhere, options.mysqlConn);
        }
        //sysAcct and company Filter
        options.sqlWhere = await this.filterSysAndCom(options.tableName, options.sqlWhere, options.sys, options.com, options.mysqlConn);

        let selectedFields: string[];
        // Get all fields by default
        if (!options.selectFields || options.selectFields[0] == "*") {
            options.selectFields = await this.getTableFields(options.tableName, options.mysqlConn,true) as string[];
            // options.selectFields = res.split(",");

        }
        //get excluded fields from config
        // const tableConfig = await options.mysqlConn.querySingle(`SELECT * FROM ${db}.table_config WHERE tableName='${options.tableName}'`);
        // let excludeFields: string[] = tableConfig?.excludeField?.split(",") || [];
        // switch (options.authURL) {
        //     case AuthURL.AUTH:
        //     case AuthURL.PUBLIC:
        //         excludeFields = excludeFields.concat(tableConfig?.authExcludeField?.split(",") || []);
        //         break;
        // }
        // let merchExc: string[] = excludeFields.concat(options.excludeFields || []);
        // merchExc = merchExc.filter((a, b) => merchExc.indexOf(a) == b);

        // Exclude from selected fieds
        selectedFields = options.selectFields;
        // merchExc.forEach(k => {
        //     let find = selectedFields.findIndex((key: string) => key == k)
        //     if (find >= 0) {
        //         selectedFields.splice(find, 1);
        //     }
        // })

        if (!selectedFields || selectedFields?.length == 0) {
            throw new BadRequestException(`No fields is selected`);
        }
        // Force select document id
        if (!selectedFields?.includes("id")) {
            selectedFields = selectedFields?.concat([`id`]);
        }

        //check fileds exists and convert to translates fields or noral field string
        selectedFields = await Promise.all(
            selectedFields?.map(async (s: any) => {
                return await this.convertSelectFiled(options.tableName, s, options.language, options.mysqlConn);
            }));


        let strWhere = options.sqlWhere || "";
        strWhere = strWhere.replace(/\s+id/gi, " t.id");
        let groupBy = "";

        const orderBy = options.sqlOrderBy || "";


        let resultQuery = `SELECT ${selectedFields.toString()} FROM ${db}.${options.tableName} AS t`;

        // Select for Paginations
        if (options.sqlLimit) {
            resultQuery = `${resultQuery} ${strWhere} ${groupBy} ${orderBy} ${options.sqlLimit}`;
        } else {
            resultQuery = `${resultQuery} ${strWhere} ${groupBy} ${orderBy}`;
        }
        let result: any = await options.mysqlConn.query(resultQuery);

        result =await Promise.all(result.map(async (r: any) => {
            const docType: MyERPDocType = await this.getDocumentType(options.tableName);
            const passwordFields = docType.fields.filter(f => f.isPassword == true);
            for (let p of passwordFields) {
                r[p.id] = null;
            }
            return r
        }))
        // result = await Promise.all(
        //     result?.map(async (r: any) => {

        //         if (options.getChild == null || options.getChild) {

        //             r = await this.getChild(r, options.tableName, options.language, options.mysqlConn);
        //         }
        //         if (options.getParent == null || options.getParent) {
        //             r = await this.getParent(r, options.tableName, options.language, options.mysqlConn);
        //         }
        //         return r;
        //     })
        // )
        return result;
    }

    async update(tableName: string, updateValue: string, where: string, mysqlConn: ConnectionAction) {
        return await mysqlConn.query(`UPDATE ${tableName} SET ${updateValue} ${where}`);
    }

    async create(tableName: string, fields: string, values: string, mysqlConn: ConnectionAction) {
        let r: any = await mysqlConn.query(`INSERT INTO  ${db}.${tableName} (${fields}) VALUES (${values})`);
        return r.insertId;
    }

    async save(tableName: string, data: any, mysqlConn: ConnectionAction) {
        const fileds = await mysqlConn.query(`DESCRIBE  ${db}.${tableName}`);
        for (let f of fileds) {
            if (f.Type.includes("date") && data[f.Field] && typeof data[f.Field] === 'string') {
                data[f.Field] = new Date(data[f.Field]);
            }
        }
        const r = await mysqlConn.query(`INSERT INTO  ${db}.${tableName} SET ? ON DUPLICATE KEY UPDATE ?`, [data, data]);
        return r.insertId;
    }

    async checkExists(tableName: string, sqlWhere: string, mysqlConn: ConnectionAction, replacement?: any): Promise<any> {
        sqlWhere = await this.filterDeleted(tableName, sqlWhere, mysqlConn);
        const check: any = await mysqlConn.querySingle(`SELECT id FROM ${db}.${tableName} ${sqlWhere}`, replacement);
        return { exists: check ? true : false };
    }

    async delete(tableName: string, sqlWhere: string, mysqlConn: ConnectionAction): Promise<void> {
        await mysqlConn.query(`UPDATE ${db}.${tableName} SET isDeleted=1 ${sqlWhere}`);
        return;
    }

    async selfOnlyFilter(tableName: string, authURL: AuthURL | undefined, sqlWhere: string | undefined, mysqlConn: ConnectionAction, userId: string): Promise<string> {
        if (authURL == AuthURL.AUTH) {
            if (tableName == "user") {
                sqlWhere = sqlWhere ? `${sqlWhere} AND  id='${userId}'` : `WHERE id='${userId}'`;
            } else {
                const docType: MyERPDocType = await this.getDocumentType(tableName);
                const columnExists = docType.fields.find(f => f.id == 'userId');
                if (columnExists) {
                    sqlWhere = sqlWhere ? `${sqlWhere} AND  userId='${userId}'` : `WHERE userId='${userId}'`;
                }
            }
        }
        return sqlWhere || '';
    }

    async filterDeleted(tableName: string, sqlWhere: string, mysqlConn: ConnectionAction) {
        const docType: MyERPDocType = await this.getDocumentType(tableName);
        const columnExists = docType.fields.find(f => f.id == 'isDeleted');
        if (columnExists) {
            const deleted = `(isDeleted=0 OR isDeleted is null)`;
            sqlWhere = sqlWhere ? `${sqlWhere} AND ${deleted}` : `WHERE ${deleted}`;
        }
        return sqlWhere;
    }
    async filterSysAndCom(tableName: string, sqlWhere: string, sys: string | undefined, com: string | undefined, mysqlConn: ConnectionAction) {
        const docType: MyERPDocType = await this.getDocumentType(tableName);
        const sysExists = docType.fields.find(f => f.id == 'sysAcct');
        if (sysExists && sys) {
            const sysFilter = `sysAcct='${sys}'`;
            sqlWhere = sqlWhere ? `${sqlWhere} AND ${sysFilter}` : `WHERE ${sysFilter}`;
        }
        const comExists = docType.fields.find(f => f.id == 'companyId');
        if (comExists && com) {
            const comFilter = `companyId='${com}'`;
            sqlWhere = sqlWhere ? `${sqlWhere} AND ${comFilter}` : `WHERE ${comFilter}`;
        }
        return sqlWhere;
    }

    async getTableFields(tableName: string, mysqlConn: ConnectionAction, nameOnly = false): Promise<MyERPField[] | string[]> {
        // const query = `SELECT group_concat(column_name) AS columns FROM INFORMATION_SCHEMA.columns WHERE table_schema='${db}' and TABLE_NAME = '${tableName}'`;
        // const result = await mysqlConn.querySingle(query);
        // return result.columns;
        const fields = (await this.getDocumentType(tableName)).fields.filter(f => f.type != 'tab' && f.type != "breakline" && f.type != 'section' && !f.isVirtual);
        if (nameOnly) {
            return fields.map(f => f.id);
        }
        return fields;
    }

    async checkTableFieldExists(tableName: string, fieldName: string, mysqlConn: ConnectionAction): Promise<boolean> {
        const query = `SELECT column_name AS columns FROM INFORMATION_SCHEMA.columns WHERE table_schema='${db}' and TABLE_NAME = '${tableName}' AND column_name='${fieldName}'`;
        const result = await mysqlConn.querySingle(query);
        return result ? true : false;
    }

    private async convertSelectFiled(tableName: string, fieldName: string, language: string | undefined, mysqlConn: ConnectionAction): Promise<string> {

        if (await this.checkTableFieldExists(tableName, fieldName, mysqlConn)) {

            const translate: any = await mysqlConn.querySingle(`SELECT translateFields FROM ${db}.table_config WHERE tableName='${tableName}'`);
            const translateFields: any = translate?.translateFields?.split(",") || [];
            let findIndex = translateFields.findIndex((t: string) => t == fieldName);
            if (findIndex >= 0) {
                return `IF(JSON_VALID(${fieldName}),
                            IF(${fieldName}->> '$.${language}' IS NULL OR ${fieldName}->> '$.${language}'='',
                            ${fieldName}->> '$.en',${fieldName}->> '$.${language}'),
                        ${fieldName}) AS ${fieldName}`;
            } else {
                return `t.${fieldName}`;
            }
        } else {
            throw new BadRequestException(`Invalid fields:${fieldName}`);
        }

    }


    async getChild(parent: any, tableName: string, language: string | undefined, mysqlConn: ConnectionAction): Promise<any> {
        // const childTables: any = await mysqlConn.query(`SELECT * FROM ${db}.table_relationship WHERE parentTable='${tableName}' AND relationship in ('ONE_TO_MANY','ONE_TO_ONE')  AND isActive=true`);
        // let child: any = {};
        // if (childTables) {
        //     for (let c of childTables) {
        //         // console.log(1)
        //         if (parent[c.parentColumn] == null) {
        //             continue;
        //         }
        //         const options: GetDataOption = {
        //             mysqlConn: mysqlConn,
        //             tableName: c.childTable,
        //             selectFields: ["*"],
        //             language: language,
        //             sqlWhere: `WHERE ${c.childColumn}='${parent[c.parentColumn]}'`,
        //             getChild: true
        //         }
        //         const childData: any = await this.getData(options);
        //         switch (c.relationship) {
        //             case TableRelationship.ONE_TO_ONE:
        //                 child[c.displayName] = childData || childData.length > 0 ? childData[0] : null;
        //                 break;
        //             case TableRelationship.ONE_TO_MANY:
        //                 child[c.displayName] = childData;
        //                 break;
        //         }

        //     }
        // }
        // return { ...parent, ...child };
    }

    async getParent(child: any, tableName: string, language: string | undefined, mysqlConn: ConnectionAction): Promise<any> {
        // const parentTables: any = await mysqlConn.query(`SELECT * FROM ${db}.table_relationship WHERE childTable='${tableName}' AND relationship in ('MANY_TO_ONE') AND isActive=true`);
        // let parent = {};
        // if (parentTables) {
        //     for (let p of parentTables) {
        //         if (!child[p.childColumn]) {
        //             continue;
        //         }
        //         const options: GetDataOption = {
        //             mysqlConn: mysqlConn,
        //             tableName: p.parentTable,
        //             selectFields: ["*"],
        //             language: language,
        //             sqlWhere: `WHERE ${p.parentColumn}='${child[p.childColumn]}'`,
        //             getParent: true
        //         }
        //         const parentData: any = await this.getData(options);
        //         switch (p.relationship) {
        //             case TableRelationship.MANY_TO_ONE:
        //                 // case TableRelationship.ONE_TO_ONE:
        //                 //     child[p.displayName] = parentData || parentData.length > 0 ? parentData[0] : null;
        //                 break;
        //         }
        //         delete child[p.joinColumn];

        //     }
        // }
        // return { ...parent, ...child };
    }

    async countData(tableName: string, where: string, mysqlConn: ConnectionAction): Promise<number> {
        const count = await mysqlConn.querySingle(`SELECT IFNULL(COUNT(id),0) as count FROM ${db}.${tableName} ${where}`);
        return count?.count || 0;
    }

    async sumData(tableName: string, field: string, where: string, mysqlConn: ConnectionAction): Promise<number> {
        const count = await mysqlConn.querySingle(`SELECT IFNULL(SUM(${field}),0) as sum FROM ${db}.${tableName} ${where}`);
        return count?.sum || 0;
    }

    async validateUpdateFields(tableName: string, body: any, mysqlConn: ConnectionAction, id?: number) {
        //TODO

        // const tableConfig: any = await mysqlConn.querySingle(`SELECT * FROM ${db}.table_config WHERE table_name='${tableName}'`);
        // if (tableConfig?.required) {
        //     const required: string[] = tableConfig.required?.split(",");
        //     for (let r of required) {
        //         if (!body.hasOwnProperty(r) || !body[r]) {
        //             throw new BadRequestException(`[${r}] is required field`, "REQUIRED_FIELD");
        //         }
        //     }
        // }
        // if (tableConfig?.uniqueField) {
        //     const unique: string[] = tableConfig.uniqueField?.split(",");
        //     for (let u of unique) {
        //         const value = body[u];
        //         let where = "";
        //         if (value) {
        //             let where = `WHERE ${u} ='${value}'`;
        //             if (id) {
        //                 where = `${where} AND !t.id=${id}`;
        //             }
        //             const check: any = await this.checkExists(tableName, where, mysqlConn);
        //             if (check.exists) {
        //                 throw new BadRequestException(`[${u}] is already in used.`, "DATA_EXISTS")
        //             }
        //         }
        //     }
        // }
    }


    async importDocTypeFile(docType: string) {
        const path = `../../../api/doctype/${docType}.ts`;
        delete require.cache[require.resolve(path)]
        return await import( /* @vite-ignore */path);
    }

    async getDocumentType(tableName: string): Promise<MyERPDocType> {
        try {
            const imp = await this.importDocTypeFile(tableName);
            return imp.documentType();
        } catch (error) {
            logger.error('Error loading document type:', error);
            throw new ServiceException(`Error loading document type [${tableName}]`);
        }
    }
}
