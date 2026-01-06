
import { ServiceException } from "../exceptions/ServiceException";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { DBFilter } from "../interfaces/api.main.interface";
import { SRequest } from "../interfaces/api.route.interface";
import { ConvertUtil } from "../utils/convert";
import { logger } from "../utils/logger";
import { ExternalScriptService } from "./api.extermal-script.service";
import { CoreService } from "./api.core.service";
import { core } from "../core/core";

export class ApiDocumentService {


    async getDocumentType(req: SRequest) {
        const document = req.params['document'];
        return core.getDocumentType(document, req.mysqlConn, req.sys, req.com, (req.language || 'en'));
    }

    async getDocuments(req: SRequest) {
        try {
            const document = core.convertUtil.convertDocTypeToTableName(req.params?.['document']);
            const options = core.convertUtil.convertQueryParamToDBOption(req);
            options.pagination = true;
            return await core.getDocuments(req, document, options);
        } catch (error) {
            if (error instanceof Error && error.constructor !== Error) {
                throw error;
            }
            logger.error('Error getting documents:', error);
            throw new ServiceException(`Error getting documents: [${document}]`);
        }
    }

    async getDocument(req: SRequest) {
        try {
            const document = core.convertUtil.convertDocTypeToTableName(req.params?.['document']);
            const id = req.params?.['id'];
            const fields: any = req.query?.['_fields']?.toString()?.split(",") || ["*"];
            const excFields: any = req.query?.['_exclude']?.toString()?.split(",") || [];
            return await core.getDocument(req, document, id, fields, excFields);
        } catch (error) {
            if (error instanceof Error && error.constructor !== Error) {
                throw error;
            }
            logger.error('Error get document:', error);
            throw new ServiceException(`Error loading document [${document}]`);
        }
    }

    async createDocument(req: SRequest) {
        try {
            const document = core.convertUtil.convertDocTypeToTableName(req.params?.['document']);
            return await core.createDocument(req, document, req.body);
        } catch (error) {
            logger.error('Error creating document type:', error);
            throw new ServiceException(`Error creating document type [${document}]`);
        }
    }

    async updateDocument(req: SRequest) {
        try {
            const document = core.convertUtil.convertDocTypeToTableName(req.params?.['document']);
            const id = req.params?.['id'];
            const filter: DBFilter = [{ field: 'id', operator: '=', value: id }];
            return await core.updateDocument(req, document, req.body, filter);
        } catch (error) {
            if (error instanceof Error && error.constructor !== Error) {
                throw error;
            }
            throw new ServiceException(`Error updating document [${document}]: ${error}`);
        }
    }

    async runEventScript(req: SRequest) {
        return await core.externalScript.runEventScript(req.params?.['document'], req);
    }

    async runCustomScript(req: SRequest) {
        return await core.externalScript.runCustomScript(req.params?.['module'], req.params?.['method'], req);
    }



}