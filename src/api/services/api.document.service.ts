
import { NoDataException } from "../exceptions/NoDataException";
import { ServiceException } from "../exceptions/ServiceException";
import { ConnectionAction } from "../interfaces/api.db.interface";
import { ApiGetParam, ApiParam, ApiSaveParam } from "../interfaces/api.main.interface";
import { ConvertUtil } from "../utils/convert";
import { logger } from "../utils/logger";
import { ExternalScriptService } from "./api.extermal-script.service";
import { ApiGlobalService } from "./api.global.service";

export class ApiDocumentService {

    readonly convertUtil = new ConvertUtil();
    readonly globalService = new ApiGlobalService();
    readonly externalScript = new ExternalScriptService

    async getDocumentType(document: string, mysqlConn?: ConnectionAction, sys?: string, com?: string, language = 'en') {
        return this.globalService.getDocumentType(document, mysqlConn, sys, com, language);
    }

    async getDocumentList(params: ApiGetParam, mysqlConn: ConnectionAction) {
        try {
            return await this.globalService.getDocumentList(params, mysqlConn);
        } catch (error) {
            if (error instanceof Error && error.constructor !== Error) {
                throw error;
            }
            logger.error('Error loading document type:', error);
            throw new ServiceException(`Error loading document type [${params.tableName}]`);
        }
    }

    async getSingleDocument(params: ApiGetParam, mysqlConn: ConnectionAction) {

        try {
            const byValue = this.convertUtil.convertToDataTypeValue(params.params['byValue']);
            const where = `WHERE ${params.params['byField']} = ${byValue}`;
            return await this.globalService.getSingleDocument(params, where, mysqlConn);
        } catch (error) {
            if (error instanceof Error && error.constructor !== Error) {
                throw error;
            }
            logger.error('Error get document type:', error);
            throw new ServiceException(`Error loading document type [${params.tableName}]`);
        }
    }

    async createDocument(params: ApiSaveParam, mysqlConn: ConnectionAction) {
        try {

            return await this.globalService.createDocument(params, mysqlConn);
        } catch (error) {
            logger.error('Error creating document type:', error);
            throw new ServiceException(`Error creating document type [${params.tableName}]`);
        }
    }

    async updateDocument(params: ApiSaveParam, mysqlConn: ConnectionAction) {
        try {

            const byValue = this.convertUtil.convertToDataTypeValue(params.params['byValue']);
            let where = `WHERE ${params.params['byField']} = ${byValue}`;
            const exists = await this.globalService.checkExists(params.tableName, where, mysqlConn, params.com, params.sys);
            if (!exists.exists) {
                throw new NoDataException(`Data not found with [${params.params['byField']}]: ${params.params['byValue']}`);
            }
            return await this.globalService.updateDocument(params, where, mysqlConn);

        } catch (error) {
            if (error instanceof Error && error.constructor !== Error) {
                throw error;
            }
            throw new ServiceException(`Error updating document [${params.tableName}]: ${error}`);
        }
    }

    async runEventScript(params: ApiParam, mysqlConn: ConnectionAction) {
        return this.externalScript.runEventScript(params, mysqlConn);
    }



}