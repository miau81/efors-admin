import { Response, NextFunction } from "express";
import { SRequest } from "../interfaces/api.route.interface";
import { ConnectionPool, dbName } from "../databases";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { ConvertUtil } from "../utils/convert";
import { JWTService } from "../services/jwt.service";
import { MyERPDocType, MyERPField } from "@myerp/interfaces/interface";
import dayjs from "dayjs";
import { ServiceException } from "../exceptions/ServiceException";
import { DBOption, GetDataOption, DBFilter } from "../interfaces/api.main.interface";
import { logger } from "../utils/logger";
import { ExternalScriptService } from "../services/api.extermal-script.service";
import { link } from "fs";

const db = dbName;
const defaultSqlLimit: number = 50;

class Core {
    public readonly convertUtil = new ConvertUtil();
    public readonly jswService = new JWTService();
    public readonly externalScript = new ExternalScriptService();

 

    async beingRequest(req: SRequest, res: Response, next: NextFunction, fn: Function) {
        const mysqlConn = await ConnectionPool()
        req.mysqlConn = mysqlConn;
        mysqlConn.beginTransaction();
        try {
            const data = await fn(req);
            mysqlConn.commit();
            res.status(200).json(data);
        } catch (error) {
            mysqlConn.rollback();
            next(error);
        } finally {
            mysqlConn.release();
        }
    }

    async getDocument(req: SRequest, document: string, id: string, fields?: string[], excludeFields?: string[]) {
        const options: DBOption = {
            filter: [{ field: 'id', operator: '=', value: id }],
            fields: fields,
            excludeFields: excludeFields,
        }
        const res = await this.getDocuments(req, document, options);
        return res?.[0];
    }

    async getSingleDocument(req: SRequest, document: string, options: DBOption) {
        const res = await this.getDocuments(req, document, options);
        return res?.[0];
    }

    async getDocuments(req: SRequest, document: string, options: DBOption) {
        
        const impDocType = await this.importDocTypeFile(document);
        const docType: MyERPDocType = await impDocType.documentType();
        const impEvent = await this.importDocTypeEventFile(document);

        const option: GetDataOption = {
            mysqlConn: req.mysqlConn!,
            document: document,
            docType: docType,
            selectFields: options.fields,
            excludeFields: options.excludeFields,
            language: req.language,
            sys: req.sys,
            com: req.com,
            user: req.user,
            getChild: options.getChild,
            getLink: options.getLink,
            filter: options.filter,
            sort: options.sort,
            limit: options.limit,
            offset: options.offset,
            search: options.search,
            searchFields: options.searchFields,
            pagination: options.pagination,
            customSql: options.customSql
        }

        if (impEvent?.beforeGet) {
            impEvent.beforeGet(null, option, req);
        }

        let res = await this.getData(option);
        let data = res.data;

        if (impEvent?.afterGet) {
            data = impEvent.afterGet(data, option, req);
        }
        const limit = option.limit || defaultSqlLimit;
        const page = Math.ceil(((option.offset || 0) + 1) / limit);
        const totalPage = Math.ceil(res.count / limit);
        const result = {
            currentPage: page,
            totalPage: totalPage,
            totalRecord: res.count,
            records: data
        };
        if (option.pagination) {
            return result;
        }
        return data;
    }

    async createDocument(req: SRequest, document: string, doc: any) {
        
        const user = req.user;
        const mysqlConn = req.mysqlConn!;
        const isSelf = req.isSelf

        const impDocType = await this.importDocTypeFile(document);
        const docType: MyERPDocType = await impDocType.documentType();
        const impEvent = await this.importDocTypeEventFile(document);

        if (impEvent?.beforeCreate) {
            doc = await impEvent.beforeCreate(doc, req);
        }

        const fields = await this.getTableFields(document, docType) as MyERPField[];
        if (fields.find(f => f.id == "lastModifiedBy")) {
            doc.lastModifiedBy = user?.id || 'SYSTEM';
        }

        if (fields.find(f => f.id == "createdBy")) {
            doc.createdBy = user?.id || 'SYSTEM';
        }
        if (fields.find(f => f.id == "userId") && isSelf) {
            doc.userId = user?.id;
        }
        if (fields.find(f => f.id == "companyId")) {
            doc.companyId = req.com
        }
        if (fields.find(f => f.id == "sysAcct")) {
            doc.sysAcct = req.sys
        }


        doc.id = await this.generateDocId(document, doc, req.com, mysqlConn);
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


        const r = await mysqlConn.query(`INSERT INTO  ${db}.${document} SET ? ON DUPLICATE KEY UPDATE ?`, [doc, doc]);
        doc = { ...doc, ...childTableValues };

        await this.updateChildTable(req, docType, doc, mysqlConn);

        if (impEvent?.afterCreate) {
            doc = await impEvent.afterCreate(doc, req);
        }

        if (impEvent?.afterSubmit && doc.docStatus == 'SUBMIT') {
            doc = await impEvent.afterSubmit(doc, doc, req);
        }

        return doc;

    }

    async updateDocument(req: SRequest, document: string, doc: any, filter?: DBFilter) {
        
        const user = req.user;
        const mysqlConn = req.mysqlConn!;


        const impDocType = await this.importDocTypeFile(document);
        const docType: MyERPDocType = await impDocType.documentType();

        const impEvent = await this.importDocTypeEventFile(document);

        if (impEvent?.beforeUpdate) {
            doc = await impEvent.beforeUpdate(doc, filter, req);
        }

        if (impEvent?.beforeSubmit && doc.docStatus == 'SUBMIT') {
            doc = await impEvent.beforeSubmit(doc, filter, req);
        }

        if (impEvent?.beforeCancel && doc.docStatus == 'CANCELLED') {
            doc = await impEvent.beforeCancel(doc, filter, req);
        }

        const fields = await this.getTableFields(document, docType) as MyERPField[];
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


        filter = await this.filterSysAndCom(document, filter, req.sys, req.com, mysqlConn, docType);

        let strWhere = this.convertUtil.ConvertDBbFilterToWhereQuery(filter);

        const previousDoc = await mysqlConn.querySingle(`SELECT * FROM ${db}.${document} ${strWhere}`);

        await this.sqlUpdate(document, doc, strWhere, mysqlConn);

        doc = { ...doc, ...childTableValues };


        await this.updateChildTable(req, docType, doc, mysqlConn);

        if (impEvent?.afterUpdate) {
            doc = await impEvent.afterUpdate(doc, previousDoc, req);
        }

        if (impEvent?.afterSubmit && doc.docStatus == 'SUBMIT') {
            doc = await impEvent.afterSubmit(doc, previousDoc, req);
        }

        if (impEvent?.afterCancel && doc.docStatus == 'CANCELLED') {
            doc = await impEvent.afterCancel(doc, previousDoc, req);
        }


        return doc;

    }

    async deleteDocument(req: SRequest, document: string, filter: DBFilter, permanentDelete = false) {
        
        const user = req.user;
        const mysqlConn = req.mysqlConn!;

        const impDocType = await this.importDocTypeFile(document);
        const docType: MyERPDocType = await impDocType.documentType();


        const impEvent = await this.importDocTypeEventFile(document);

        if (impEvent?.beforeDelete) {
            await impEvent.beforeDelete(docType, filter, req);
        }

        filter = await this.filterSysAndCom(document, filter, req.sys, req.com, mysqlConn, docType);

        let strWhere = this.convertUtil.ConvertDBbFilterToWhereQuery(filter);
        if (!permanentDelete) {
            const fields = await this.getTableFields(document, docType) as MyERPField[];
            const doc: any = { isDeleted: 1 }
            if (fields.find(f => f.id == "lastModifiedBy")) {
                doc.lastModifiedBy = user?.id || 'SYSTEM';
            }
            await this.sqlUpdate(document, doc, strWhere, mysqlConn);
        } else {
            await mysqlConn.querySingle(`DELETE * FROM ${db}.${document} ${strWhere}`);
        }

        if (impEvent?.afterDelete) {
            await impEvent.afterDelete(document, req);
        }

    }

    async importDocTypeFile(docType: string) {
        const path = new URL(`../../../api/doctype/${docType}.ts`, import.meta.url).href;
        return await import(/* @vite-ignore */ path);
    }

    async importDocTypeEventFile(docType: string) {
        try {
            const path = new URL(`../../../api/events/${docType}.event.ts`, import.meta.url).href;
            return await import(/* @vite-ignore */ path);
        } catch {
            return;
        }
    }

    private async getData(options: GetDataOption): Promise<any> {
        options.filter = await this.selfOnlyFilter(options.document, options.filter, options.user, options.mysqlConn);
        if (!options.includeDeleted) {
            options.filter = await this.filterDeleted(options.docType, options.filter, options.mysqlConn);
        }
        //sysAcct and company Filter
        options.filter = await this.filterSysAndCom(options.document, options.filter, options.sys, options.com, options.mysqlConn, options.docType);
        let selectedFields: string[] = options.selectFields || [];
        // Get all fields by default
        if (!options.selectFields || options.selectFields[0] == "*") {
            selectedFields = await this.getTableFields(options.document, options.docType, true) as string[];
        }

        // Search fields
        if (options.search) {
            const searchFields = options.searchFields || [];
            for (let i = 0; i <= searchFields.length - 1; i++) {
                if (i > 0) {
                    options.filter.push(['or']);
                }
                options.filter.push([{ field: searchFields[i], operator: "like", value: `%${options.search}%` }])
                i++;
            }
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
        let strWhere = this.convertUtil.ConvertDBbFilterToWhereQuery(options.filter);


        strWhere = strWhere.replace(/\s+id/gi, " t.id");
        let groupBy = "";

        const defaultSortField = options.docType.defaultSorting || options.docType.fields.find(f => f.id == 'createdDate') ? 'createdDate DESC' : 'id DESC'
        const sort = options.sort || defaultSortField;
        const orderBy = `ORDER BY ${sort}`;
        let resultQuery = `SELECT ${selectedFields.toString()} FROM ${db}.${options.document} AS t`;
        const limit = `LIMIT ${options.limit || defaultSqlLimit} OFFSET ${options.offset || 0}`;
        resultQuery = `${resultQuery} ${strWhere} ${groupBy} ${orderBy} ${limit}`;

        let result: any = await options.mysqlConn.query(resultQuery);
        const getCount = `SELECT COUNT(1) as count FROM ${db}.${options.document} AS t ${strWhere} ${groupBy}`;
        const count = (await options.mysqlConn.querySingle(getCount)).count;
        result = await Promise.all(result.map(async (r: any) => {
            const docType: MyERPDocType = options.docType
            const passwordFields = docType.fields.filter(f => f.isPassword == true);
            for (let p of passwordFields) {
                r[p.id] = null;
            }
            if (options.getChild == null || options.getChild) {
                r = await this.getChildData(r, docType, options.language || 'en', options.mysqlConn);
            }
            if (options.getLink == null || options.getLink) {
                r = this.getLinkData(r, docType, options.language || 'en', options.mysqlConn);
            }
            return r;
        }))
        return { data: result, count: count };
    }

    private async selfOnlyFilter(document: string, filter: DBFilter | undefined, user: any, mysqlConn: ConnectionAction) {
        // if (authURL == AuthURL.AUTH) {
        //     if (tableName == "user") {
        //         sqlWhere = sqlWhere ? `${sqlWhere} AND  id='${userId}'` : `WHERE id='${userId}'`;
        //     } else {
        //         const docType: MyERPDocType = await this.getDocumentType(tableName);
        //         const columnExists = docType.fields.find(f => f.id == 'userId');
        //         if (columnExists) {
        //             sqlWhere = sqlWhere ? `${sqlWhere} AND  userId='${userId}'` : `WHERE userId='${userId}'`;
        //         }
        //     }
        // }
        // return sqlWhere || '';
        //TODO:
        return filter;
    }

    private async filterDeleted(docType: MyERPDocType, filter: DBFilter | undefined, mysqlConn: ConnectionAction) {
        filter = filter ?? [];
        try {
            const columnExists = docType.fields.find(f => f.id == 'isDeleted');
            if (columnExists) {
                const deleted = `(isDeleted=0 OR isDeleted is null)`;
                filter.push([{ field: 'isDeleted', operator: '=', value: 0 }, "or", { field: 'isDeleted', operator: 'is', value: null }]);

            }
        } catch {

        }
        return filter;
    }

    private async filterSysAndCom(document: string, filter: DBFilter | undefined, sys: string | undefined, com: string | undefined, mysqlConn: ConnectionAction, docType?: MyERPDocType) {
        filter = filter ?? [];
        if (!docType) {
            try {
                docType = await this.getDocumentType(document);
            } catch {
                return filter;
            }
        }
        const sysExists = docType.fields.find(f => f.id == 'sysAcct');
        if (sysExists && sys) {
            filter.push({ field: 'sysAcct', operator: "=", value: sys });
        }
        const comExists = docType.fields.find(f => f.id == 'companyId');
        if (comExists && com) {
            filter.push({ field: 'companyId', operator: "=", value: com });
        }
        return filter;
    }

    async getDocumentType(document: string, mysqlConn?: ConnectionAction, sys?: string, com?: string, language: string = 'en'): Promise<MyERPDocType> {
        try {
            const imp = await this.importDocTypeFile(document);
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
                const where = await this.filterSysAndCom(linkTable, [], sys, com, mysqlConn);
                const filters = (field.linkOptions?.filters || []).join(" AND ");
                const filter = filters ? ` AND ${filters}` : "";
                let defaultSql = `SELECT ${labelFields.join()},${valueField} FROM ${linkTable} ${where}${filter}`;
                const sql = field.linkOptions?.customSql || defaultSql;
                // if (field.linkOptions?.filters) {
                //     field.options = [];
                //     continue;
                // }
                const getDataOptions: GetDataOption = {
                    mysqlConn: mysqlConn,
                    document: linkTable,
                    selectFields: [...labelFields, valueField],
                    docType: await this.getDocumentType(linkTable),
                    com: com,
                    sys: sys,
                    filter:where,

                }
                const linkDoc = (await this.getData(getDataOptions)).data;

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
            // console.log(tableFields[0].fieldsDocType)
            return docType;
        } catch (error) {
            logger.error('Error loading document type:', error);
            console.log(error)
            throw new ServiceException(`Error loading document type [${document}]`);

        }
    }

    private async getTableFields(document: string, docType?: MyERPDocType, nameOnly = false): Promise<MyERPField[] | string[]> {
        if (!docType || docType.id != document) {
            docType = await this.getDocumentType(document);

        }
        const fields = docType!.fields.filter(f => this.isTableField(f));
        if (nameOnly) {
            return fields.map(f => f.id) as string[];
        }
        return fields as MyERPField[];
    }

    private async getChildData(parent: any, parentDocType: MyERPDocType, language: string, mysqlConn: ConnectionAction): Promise<any> {
        const childTables = parentDocType.fields?.filter(f => f.type == "table");
        const data: any = {};
        if (childTables.length == 0) {
            return parent;
        }
        for (let c of childTables) {
            const childDocument = c.options;
            const childDocType = await this.getDocumentType(childDocument);
            const parentField = childDocType.fields.find(f => f.parentField);
            if (!parentField) {
                continue;
            }
            const options: GetDataOption = {
                mysqlConn: mysqlConn,
                document: childDocument,
                selectFields: ["*"],
                language: language,
                filter: [{ field: parentField.id, operator: '=', value: parent[parentField.parentField] }],
                getChild: true,
                docType: childDocType,
                pagination: false
            }
            const childData: any = await this.getData(options);
            data[c.id] = childData.data;
        }
        return { ...parent, ...data };
    }

    private async getLinkData(link: any, linkDocType: MyERPDocType, language: string, mysqlConn: ConnectionAction): Promise<any> {
        const links = linkDocType.fields?.filter(f => f.type == "link" && f.linkOptions?.isDoc);
        const data: any = {};
        if (links.length == 0) {
            return link;
        }

        for (let l of links) {
            const linkDocument = l.options;
            const linkDoctype = await this.getDocumentType(linkDocument);
            const options: GetDataOption = {
                mysqlConn: mysqlConn,
                document: linkDocument,
                selectFields: ["*"],
                language: language,
                filter: [{ field: "id", operator: "=", value: link[l.id] }],
                getChild: true,
                docType: linkDoctype
            }
            const linkData: any = await this.getData(options);

            data[l.id + 'Obj'] = linkData?.length > 0 ? linkData[0] : undefined;
        }
        return { ...link, ...data };
    }

    private async sqlUpdate(document: string, doc: any, sqlWhere: string, mysqlConn: ConnectionAction) {
        const updateValues: string[] = [];
        Object.keys(doc).forEach(b => {
            let value = this.convertUtil.convertToDataTypeValue(doc[b]);
            let str = `${b} = ${value}`;
            updateValues.push(str);
        });
        await mysqlConn.query(`UPDATE ${db}.${document} SET ${updateValues.toString()} ${sqlWhere}`);
    }


    private isTableField(field: MyERPField) {
        switch (field.type) {
            case 'tab':
            case "breakline":
            case 'section':
            case 'table':
                return false;
        }
        return !field.isVirtual;
    }

    private async generateDocId(document: string, data: any, company: any, mysqlConn: ConnectionAction) {
        const docType = await this.getDocumentType(document);
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
                const sql = `SELECT sequence FROM ${db}.sequence WHERE companyId='${company}' AND tableName='${document}' AND baseFormat='${baseFormat}' AND tableField='id'`;
                const seq = await mysqlConn.querySingle(sql);
                const nextSeq = (seq?.sequence || 0) + 1;
                id = baseFormat.replace(/\{(0+)\}/, match => nextSeq.toString().padStart(match.length - 2, '0'));
                if (seq) {
                    seq.sequence = nextSeq;
                }
                const updateSeq = {
                    companyId: company,
                    tableName: document,
                    baseFormat: baseFormat,
                    tableField: 'id',
                    sequence: nextSeq
                }
                const r = await mysqlConn.query(`INSERT INTO  ${db}.sequence SET ? ON DUPLICATE KEY UPDATE ?`, [updateSeq, updateSeq]);

                break;
        }
        return id;
    }

    async updateChildTable(req: SRequest, parentDocType: MyERPDocType, parentDoc: any, mysqlConn: ConnectionAction) {

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
                if (childDoc.id) {
                    const filter: DBFilter = [{ field: 'id', operator: '=', value: childDoc.id }];
                    await this.updateDocument(req, childTableName, childDoc, filter);
                } else {
                    childDoc[parentField!.id] = parentDoc[parentField?.parentField];
                    await this.createDocument(req, childTableName, childDoc);
                }

            }
        }


    }

}

export const core = new Core();