import dayjs from "dayjs";
import { MyERPDocType, MyERPField } from "../../app/@interfaces/interface";
import { dbName } from "../databases";
import { NoDataException } from "../exceptions/NoDataException";
import { ServiceException } from "../exceptions/ServiceException";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { GetDataOption } from "../interfaces/api.entity.interface";
import { ApiRequestMethod, AuthURL } from "../interfaces/api.enum";
import { ApiGetParam, ApiSaveParam } from "../interfaces/api.main.interface";
import { ConvertUtil } from "../utils/convert";
import { logger } from "../utils/logger";
import { JWTService } from "./jwt.service";


const db = dbName;
export class ApiGlobalService {

    readonly convertUtil = new ConvertUtil();
    readonly jswService = new JWTService();


    async getCompany(id: string, user: any, mysqlConn: ConnectionAction) {
        const param: ApiGetParam = {
            tableName: "company",
            method: ApiRequestMethod.GET,
            user: user
        }
        return await this.getSingleDocument(param, `WHERE id='${id}'`, mysqlConn);
    }

    async getSingleDocument(params: ApiGetParam, where: string, mysqlConn: ConnectionAction) {
        const imp = await this.importDocTypeFile(params.tableName);
        const docType: MyERPDocType = await imp.documentType();

        if (imp.beforeGet) {
            imp.beforeGet(null, params, docType, mysqlConn);
        }

        const option: GetDataOption = {
            mysqlConn: mysqlConn,
            tableName: params.tableName,
            docType: docType,
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
        let data: any = await this.getData(option);
        if (!data || data?.length == 0) {
            throw new NoDataException(`Not data found`);
        }
        data = data[0];
        if (imp.afterGet) {
            data = imp.afterGet(data, params, docType, mysqlConn);
        }
        return data;
    }

    async getDocumentList(params: ApiGetParam, mysqlConn: ConnectionAction) {
        const imp = await this.importDocTypeFile(params.tableName);
        const docType: MyERPDocType = await imp.documentType();

        if (imp.beforeGetList) {
            imp.beforeGetList(null, params, docType, mysqlConn);
        }

        const where = params.customWhereQuery || await this.populateWhareQuery(params);
        const pagination = `LIMIT ${params.pagination?.limit || 50} OFFSET ${params.pagination?.start || 0}`;

        let orderBy = "";
        let sortField = params.sorting?.sortField;
        if (sortField) {
            orderBy = `ORDER BY t.${sortField} ${params.sorting?.sortBy || 'ASC'}`;
        }
        const totalRecord: number = await this.countData(params.tableName, where, mysqlConn);
        const options: GetDataOption = {
            tableName: params.tableName,
            selectFields: params.selectFields,
            docType: docType,
            excludeFields: params.excludeFields,
            sqlWhere: where,
            sqlOrderBy: orderBy,
            sqlLimit: pagination,
            authURL: params.authURL,
            language: params.language,
            user: params.user,
            mysqlConn: mysqlConn,
            getChild: params.getChild,
            getParent: params.getParent,
            sys: params.sys,
            com: params.com,
        };

        let docs = await this.getData(options);

        if (imp.afterGetList) {
            docs = imp.afterGetList(docs, params, docType, mysqlConn);
        }

        const limit = this.convertUtil.convertToDataTypeValue(params.pagination?.limit);
        const page = Math.ceil((this.convertUtil.convertToDataTypeValue(params.pagination?.start) + 1) / limit);
        const totalPage = Math.ceil(totalRecord / limit);
        const result = {
            currentPage: page,
            totalPage: totalPage,
            totalRecord: totalRecord,
            records: docs
        };
        return result;
    }

    async createDocument(params: ApiSaveParam, mysqlConn: ConnectionAction) {
        const user = params.user;
        let doc = params.body;
        const isAuth = params.authURL == AuthURL.AUTH;
        const tableName = params.tableName;

        const imp = await this.importDocTypeFile(tableName);
        const docType: MyERPDocType = await imp.documentType();

        if (imp.beforeCreate) {
            doc = await imp.beforeCreate(doc, params, docType, mysqlConn);
        }

        const fields = await this.getTableFields(tableName, mysqlConn, docType) as MyERPField[];
        if (fields.find(f => f.id == "lastModifiedBy")) {
            doc.lastModifiedBy = user?.id || 'SYSTEM';
        }

        if (fields.find(f => f.id == "createdBy")) {
            doc.createdBy = user?.id || 'SYSTEM';
        }
        if (fields.find(f => f.id == "userId") && isAuth) {
            doc.userId = user?.id;
        }
        if (fields.find(f => f.id == "companyId")) {
            doc.companyId = params.com
        }
        if (fields.find(f => f.id == "sysAcct")) {
            doc.sysAcct = params.sys
        }


        doc.id = await this.generateDocId(tableName, doc, mysqlConn, params.com);
        for (let f of fields) {
            if (f.isPassword) {
                if (doc[f.id]) {
                    doc[f.id] = await this.jswService.hashPassword(doc[f.id]);
                } else {
                    delete doc[f.id];
                }
                continue;
            }
            if ((f.type == "date" || f.type == "datetime") && doc[f.id] && typeof doc[f.id] == "string") {
                doc[f.id] = new Date(doc[f.id]);
            }
        }

        const childTableValues: any = {};
        for (const field of docType.fields.filter(f => f.type == 'table')) {
            childTableValues[field.id] = doc[field.id] ? this.convertUtil.deepCopyObject(doc[field.id]) : null;
            delete doc[field.id];
        }


        const r = await mysqlConn.query(`INSERT INTO  ${db}.${tableName} SET ? ON DUPLICATE KEY UPDATE ?`, [doc, doc]);
        doc = { ...doc, ...childTableValues };

        await this.updateChildTable(docType, params, doc, mysqlConn);

        if (imp.afterCreate) {
            doc = await imp.afterCreate(doc, params, docType, mysqlConn);
        }

        if (imp.onSubmit && doc.doc_status == 'SUBMIT') {
            doc = await imp.onSubmit(doc, params, docType, mysqlConn);
        }

        return doc;

    }


    async updateDocument(params: ApiSaveParam, where: string, mysqlConn: ConnectionAction) {
        const user = params.user;
        const tableName = params.tableName;
        let doc = params.body;

        const imp = await this.importDocTypeFile(tableName);
        const docType: MyERPDocType = await imp.documentType();

        if (imp.beforeUpdate) {
            doc = await imp.beforeUpdate(doc, params, docType, mysqlConn);
        }

        if (imp.beforeSubmit && doc.doc_status == 'SUBMIT') {
            doc = await imp.beforeSubmit(doc, params, docType, mysqlConn);
        }

        if (imp.beforeCancel && doc.doc_status == 'CANCELLED') {
            doc = await imp.beforeCancel(doc, params, docType, mysqlConn);
        }

        const fields = await this.getTableFields(tableName, mysqlConn, docType) as MyERPField[];
        if (fields.find(f => f.id == "lastModifiedBy")) {
            doc.lastModifiedBy = user?.id || 'SYSTEM';
        }
        delete doc.createdDate;
        delete doc.createdBy;
        delete doc.userId;
        delete doc.copmayId;
        delete doc.sysAcct;


        for (let f of fields) {
            if (f.isNotEditable) {
                delete doc[f.id];
                continue;
            }
            if (f.isPassword) {
                if (doc[f.id]) {
                    doc[f.id] = await this.jswService.hashPassword(doc[f.id]);
                } else {
                    delete doc[f.id];
                }
                continue;
            }
            if ((f.type == "date" || f.type == "datetime") && doc[f.id] && typeof doc[f.id] == "string") {
                doc[f.id] = new Date(doc[f.id]);
            }

        }

        const childTableValues: any = {};
        for (const field of docType.fields.filter(f => f.type == 'table')) {
            childTableValues[field.id] = doc[field.id] ? this.convertUtil.deepCopyObject(doc[field.id]) : null;
            delete doc[field.id];
        }


        where = await this.filterSysAndCom(tableName, where, params.com, params.sys, mysqlConn, docType);

        const previousDoc = await mysqlConn.querySingle(`SELECT doc_status FROM ${tableName} ${where}`);




        await this.sqlUpdate(tableName, doc, where, mysqlConn);

        doc = { ...doc, ...childTableValues };


        await this.updateChildTable(docType, params, doc, mysqlConn);

        if (imp.afterUpdate) {
            doc = await imp.afterUpdate(doc, params, docType, mysqlConn);
        }

        if (imp.afterSubmit && doc.doc_status == 'SUBMIT') {
            doc = await imp.afterSubmit(doc, params, docType, mysqlConn, previousDoc);
        }

        if (imp.afterCancel && doc.doc_status == 'CANCELLED') {
            doc = await imp.afterCancel(doc, params, docType, mysqlConn, previousDoc);
        }


        return doc;

    }

    async updateChildTable(parentDocType: MyERPDocType, parentParams: ApiSaveParam, parentDoc: any, mysqlConn: ConnectionAction) {

        const childTables = parentDocType.fields?.filter(f => f.type == "table");
        for (const child of childTables) {
            const childDocs = parentDoc[child.id];
            if (!childDocs || childDocs.length == 0) {
                continue;
            }
            const childTableName = child.options;
            const childDocType = await this.getDocumentType(childTableName);
            const parentField = childDocType.fields.find(f => f.parentField);
            const sqlWhere = `WHERE ${parentField?.id}='${parentDoc[parentField?.parentField]}'`;
            let sqlDelete = ''
            if (childDocs.length == 0) {
                sqlDelete = `DELETE FROM ${db}.${childTableName} ${sqlWhere}`;
                mysqlConn.query(sqlDelete);
                continue;
            } else {
                const childIds = childDocs.filter((d: any) => d.id).map((m: any) => `'${m.id}'`);
                if (childIds.length > 0) {
                    sqlDelete = `DELETE FROM ${db}.${childTableName} ${sqlWhere} AND id NOT IN (${childIds.join(",")})`;
                    mysqlConn.query(sqlDelete);
                }
            }


            for (const childDoc of childDocs) {
                const childParams: ApiSaveParam = {
                    ...parentParams,
                    body: childDoc,
                    tableName: childTableName,
                    queryParam: null,
                    params: null,
                }
                if (childDoc.id) {
                    childParams.method = ApiRequestMethod.UPDATE;
                    await this.updateDocument(childParams, `WHERE id='${childDoc.id}'`, mysqlConn);
                } else {
                    childDoc[parentField!.id] = parentDoc[parentField?.parentField];
                    childParams.method = ApiRequestMethod.CREATE;
                    await this.createDocument(childParams, mysqlConn);
                }

            }
        }


    }

    async getData(options: GetDataOption): Promise<any> {
        options.sqlWhere = await this.selfOnlyFilter(options.tableName, options.authURL, options.sqlWhere, options.mysqlConn, options.user?.id);
        if (!options.includeDeleted) {
            options.sqlWhere = await this.filterDeleted(options.tableName, options.sqlWhere, options.mysqlConn);
        }
        //sysAcct and company Filter
        options.sqlWhere = await this.filterSysAndCom(options.tableName, options.sqlWhere, options.sys, options.com, options.mysqlConn, options.docType);
        let selectedFields: string[] = [];
        // Get all fields by default
        if (!options.selectFields || options.selectFields[0] == "*") {
            selectedFields = await this.getTableFields(options.tableName, options.mysqlConn, options.docType, true) as string[];
        }

        // Force select document id
        if (!selectedFields.includes("id")) {
            selectedFields?.push('id');
        }
        // Set Translate fields
        selectedFields = selectedFields?.map(sf => {
            const field = options.docType.fields.find(f => f.id == sf);
            if (!field) {
                throw new ServiceException(`Table field does not exists:[${sf}]`, "TABLE_FIELD_NOT_EXISTS");
            }
            if (field?.isTranslatable) {
                return `IF(JSON_VALID(t.${sf}),
                        IF(t.${sf}->> '$.${options.language}' IS NULL OR t.${sf}->> '$.${options.language}'='',
                        t.${sf}->> '$.en',t.${sf}->> '$.${options.language}'),
                        t.${sf}) AS ${sf}`;
            }
            return `t.${sf}`;
        })

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

        // merchExc.forEach(k => {
        //     let find = selectedFields.findIndex((key: string) => key == k)
        //     if (find >= 0) {
        //         selectedFields.splice(find, 1);
        //     }
        // })

        // if (!selectedFields || selectedFields?.length == 0) {
        //     throw new BadRequestException(`No fields is selected`);
        // }


        //check fileds exists and convert to translates fields or noral field string
        // selectedFields = await Promise.all(
        //     selectedFields?.map(async (s: any) => {
        //         return await this.convertSelectFiled(options.tableName, s, options.language, options.mysqlConn);
        //     }));



        let strWhere = options.sqlWhere || "";
        strWhere = strWhere.replace(/\s+id/gi, " t.id");
        let groupBy = "";


        const defaultSortField = options.docType.fields.find(f => f.id == 'createdDate') ? 'createdDate' : 'id'


        const orderBy = options.sqlOrderBy || `ORDER BY ${defaultSortField} ASC`;


        let resultQuery = `SELECT ${selectedFields.toString()} FROM ${db}.${options.tableName} AS t`;

        // Select for Paginations
        if (options.sqlLimit) {
            resultQuery = `${resultQuery} ${strWhere} ${groupBy} ${orderBy} ${options.sqlLimit}`;
        } else {
            resultQuery = `${resultQuery} ${strWhere} ${groupBy} ${orderBy}`;
        }

        let result: any = await options.mysqlConn.query(resultQuery);

        result = await Promise.all(result.map(async (r: any) => {
            const docType: MyERPDocType = options.docType // await this.getDocumentType(options.tableName, options.mysqlConn);
            const passwordFields = docType.fields.filter(f => f.isPassword == true);
            for (let p of passwordFields) {
                r[p.id] = null;
            }
            if (options.getChild == null || options.getChild) {
                r = await this.getChildData(r, docType, options.language || 'en', options.mysqlConn);
            }
            if (options.getParent == null || options.getParent) {
                r = this.getLinkData(r, docType, options.language || 'en', options.mysqlConn);
            }
            return r;
        }))
        return result;
    }

    async getChildData(parent: any, parentDocType: MyERPDocType, language: string, mysqlConn: ConnectionAction): Promise<any> {
        const childTables = parentDocType.fields?.filter(f => f.type == "table");
        const data: any = {};
        if (childTables.length == 0) {
            return parent;
        }
        for (let c of childTables) {
            const childTableName = c.options;
            const childDocType = await this.getDocumentType(childTableName);
            const parentField = childDocType.fields.find(f => f.parentField);
            if (!parentField) {
                continue;
            }

            const options: GetDataOption = {
                mysqlConn: mysqlConn,
                tableName: childTableName,
                selectFields: ["*"],
                language: language,
                sqlWhere: `WHERE ${parentField.id}='${parent[parentField.parentField]}'`,
                getChild: true,
                docType: childDocType
            }
            const childData: any = await this.getData(options);
            data[c.id] = childData;
        }
        return { ...parent, ...data };
    }
    async getLinkData(link: any, linkDocType: MyERPDocType, language: string, mysqlConn: ConnectionAction): Promise<any> {
        const links = linkDocType.fields?.filter(f => f.type == "link" && f.linkOptions?.isDoc);
        const data: any = {};
        if (links.length == 0) {
            return link;
        }

        for (let l of links) {
            const linkTableName = l.options;
            const linkDoctype = await this.getDocumentType(linkTableName);
            const options: GetDataOption = {
                mysqlConn: mysqlConn,
                tableName: linkTableName,
                selectFields: ["*"],
                language: language,
                sqlWhere: `WHERE id='${link[l.id]}'`,
                getChild: true,
                docType: linkDoctype
            }
            const linkData: any = await this.getData(options);

            data[l.id + 'Obj'] = linkData?.length > 0 ? linkData[0] : undefined;
        }
        return { ...link, ...data };
    }

    async getTableFields(tableName: string, mysqlConn: ConnectionAction, docType?: MyERPDocType, nameOnly = false): Promise<MyERPField[] | string[]> {
        if (!docType || docType.id != tableName) {
            docType = await this.getDocumentType(tableName);

        }
        const fields = docType!.fields.filter(f => this.isTableField(f));
        if (nameOnly) {
            return fields.map(f => f.id) as string[];
        }
        return fields as MyERPField[];
    }

    isTableField(field: MyERPField) {
        switch (field.type) {
            case 'tab':
            case "breakline":
            case 'section':
            case 'table':
                return false;
        }
        return !field.isVirtual;
    }

    async getDocumentType(tableName: string, mysqlConn?: ConnectionAction, sys?: string, com?: string, language: string = 'en'): Promise<MyERPDocType> {
        try {
            const imp = await this.importDocTypeFile(tableName);
            const docType: MyERPDocType = imp.documentType();
            if (!mysqlConn) {
                return docType;
            }
            // populate link fields
            const linkFields = docType.fields.filter(f => f.type == "link");
            for (let field of linkFields) {
                const linkTable = field.options;
                const labelFields = field.linkOptions!.labelField.split(",");
                const valueField = field.linkOptions?.valueField!;
                const where = await this.filterSysAndCom(linkTable, "", sys, com, mysqlConn);
                const filters = (field.linkOptions?.filters || []).join(" AND ");
                const filter = filters ? ` AND ${filters}` : "";
                let defaultSql = `SELECT ${labelFields.join()},${valueField} FROM ${linkTable} ${where}${filter}`;
                const sql = field.linkOptions?.customSql || defaultSql;
                // if (field.linkOptions?.filters) {
                //     field.options = [];
                //     continue;
                // }
                const linkDoc = await mysqlConn.query(sql);
                const options = [];
                for (const doc of linkDoc) {
                    let label = field.linkOptions?.format;
                    if (!label) {
                        label = labelFields.map(f => doc[f]).join(" - ");
                    } else {
                        for (let f of labelFields) {
                            label = label.replaceAll(`{{${f}}}`, doc[f]);
                        }
                    }
                    options.push({
                        value: doc[valueField],
                        label: label || doc[valueField]
                    })
                }
                field.options = options;
                if (field.canAddNew) {
                    field.fieldsDocType = await this.getDocumentType(linkTable, mysqlConn, sys, com, language);
                }
            }
            // populate table fields
            const tableFields = docType.fields.filter(f => f.type == "table");
            for (let field of tableFields) {
                const linkTable = field.options;
                field.fieldsDocType = await this.getDocumentType(linkTable, mysqlConn, sys, com, language);
            }
            return docType;
        } catch (error) {
            logger.error('Error loading document type:', error);
            throw new ServiceException(`Error loading document type [${tableName}]`);

        }
    }

    async countData(tableName: string, where: string, mysqlConn: ConnectionAction): Promise<number> {
        const count = await mysqlConn.querySingle(`SELECT IFNULL(COUNT(id),0) as count FROM ${db}.${tableName} ${where}`);
        return count?.count || 0;
    }


    async checkExists(tableName: string, sqlWhere: string, mysqlConn: ConnectionAction, com?: string, sys?: string, docType?: MyERPDocType, replacement?: any): Promise<any> {
        sqlWhere = await this.filterDeleted(tableName, sqlWhere, mysqlConn);
        sqlWhere = await this.filterSysAndCom(tableName, sqlWhere, com, sys, mysqlConn, docType);
        console.log(sqlWhere)
        const check: any = await mysqlConn.querySingle(`SELECT id FROM ${db}.${tableName} ${sqlWhere}`, replacement);
        return { exists: check ? true : false };
    }

    async filterDeleted(tableName: string, sqlWhere: string, mysqlConn: ConnectionAction) {
        try {
            const docType: MyERPDocType = await this.getDocumentType(tableName);
            const columnExists = docType.fields.find(f => f.id == 'isDeleted');
            if (columnExists) {
                const deleted = `(isDeleted=0 OR isDeleted is null)`;
                sqlWhere = sqlWhere ? `${sqlWhere} AND ${deleted}` : `WHERE ${deleted}`;
            }
        } catch {

        }
        return sqlWhere;
    }

    async sqlUpdate(tableName: string, doc: any, sqlWhere: string, mysqlConn: ConnectionAction) {
        const updateValues: string[] = [];
        Object.keys(doc).forEach(b => {
            let value = this.convertUtil.convertToDataTypeValue(doc[b]);
            let str = `${b} = ${value}`;
            updateValues.push(str);
        });
        await mysqlConn.query(`UPDATE ${tableName} SET ${updateValues.toString()} ${sqlWhere}`);
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

    async filterSysAndCom(tableName: string, sqlWhere: string, sys: string | undefined, com: string | undefined, mysqlConn: ConnectionAction, docType?: MyERPDocType) {
        if (!docType) {
            try {
                docType = await this.getDocumentType(tableName);
            } catch {
                return sqlWhere;
            }
        }
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



    private async importDocTypeFile(docType: string) {
        const path = new URL(`../../../api/doctype/${docType}.ts`, import.meta.url).href;
        return await import(/* @vite-ignore */ path);
    }

    private async generateDocId(tableName: string, data: any, mysqlConn: ConnectionAction, company: any) {
        const docType = await this.getDocumentType(tableName);
        let id;
        switch (docType.namingType) {
            case "byField":
                id = data[docType.namingFormat!];
                break;
            case "random":
                id = this.convertUtil.generateUniqueId();
                break;
            case "date-sequence":
            case "sequence":
                const dateToReplace = docType.namingFormat!.match(/{(.*?)}/g) || [];
                // throw new Error("2222")
                let baseFormat = `${company}-${docType.namingFormat!}`;
                if (dateToReplace) {
                    for (const r of dateToReplace) {
                        const key = r.slice(1, -1); // remove { and }
                        let value = '';
                        if (!key.startsWith('0')) {
                            // Treat as date format
                            value = dayjs().format(key) // e.g., 'YYDDMM' or 'MM'
                            baseFormat = baseFormat.replace(r, value);
                        }

                    }
                }
                const sql = `SELECT sequence FROM ${db}.sequence WHERE companyId='${company}' AND tableName='${tableName}' AND baseFormat='${baseFormat}' AND tableField='id'`;
                const seq = await mysqlConn.querySingle(sql);
                const nextSeq = (seq?.sequence || 0) + 1;
                id = baseFormat.replace(/\{(0+)\}/, match => nextSeq.toString().padStart(match.length - 2, '0'));
                console.log(id)
                if (seq) {
                    seq.sequence = nextSeq;
                }
                const updateSeq = {
                    companyId: company,
                    tableName: tableName,
                    baseFormat: baseFormat,
                    tableField: 'id',
                    sequence: nextSeq
                }
                const r = await mysqlConn.query(`INSERT INTO  ${db}.sequence SET ? ON DUPLICATE KEY UPDATE ?`, [updateSeq, updateSeq]);

                break;
        }
        return id;
    }

    private async populateWhareQuery(params: ApiGetParam) {
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

    async importDocTypeEventFile(docType: string) {
        const path = new URL(`../../../api/events/${docType}.event.ts`, import.meta.url).href;
        return await import(/* @vite-ignore */ path);
    }

}
