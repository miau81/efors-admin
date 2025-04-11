
import dayjs from "dayjs";
import { BadRequestException } from "../exceptions/BadRequestException";
import { FilterType, OperatorEnum, ApiRequestMethod, OrderBy } from "../interfaces/api.enum";
import { Filter, ApiParam } from "../interfaces/api.main.interface";
import { SRequest } from "../interfaces/api.route.interface";
export class ConvertUtil {

    public convertToDataTypeValue(value: any) {

        try {
            value = JSON.parse(value);
            value = value == null ? "null" : value;
        } catch {
            if (value instanceof Date) {
                value = `'${dayjs(value).format('YYYY-MM-DD HH:mm:ss')}'`;
            } else if (typeof value === 'string') {
                value = `'${value.replace("'", "''")}'`;

            }
        }
        return value;
    }

    public async convertFilterString(filter: Filter, tableName: string) {
        let field = filter.field;
        let values: any = [];
        let value = filter.value;
        switch (filter.type) {
            case FilterType.year:
                field = `Year(${field})`;
                break;
            case FilterType.date:
                field = `Date(${field})`;
                break;
            case FilterType.month:
                values = value.split(",");
                if (values.length > 1) {
                    value = `${this.firstDayOfMonth(values[0])},${this.lastDayOfMonth(values[1])}`;
                } else {
                    value = `${this.firstDayOfMonth(values[0])},${this.lastDayOfMonth(values[0])}`;
                }
                filter.operator = OperatorEnum.between;
                break
            // case "text":
            // case "dateTime"
        }
        switch (filter.operator) {
            case OperatorEnum.in:
            case OperatorEnum.notin:
                values = [];
                value.split(",").forEach((v: any) => {
                    values.push(this.convertToDataTypeValue(v));
                });
                value = `(${values.toString()})`;
                break;
            case OperatorEnum.between:
                values = [];
                value.split(",").forEach((v: any) => {
                    values.push(this.convertToDataTypeValue(v));
                });
                value = `${values.join(" AND ")}`;
                break
            default:
                value = this.convertToDataTypeValue(value);
        }
        return `${field} ${filter.operator} ${value}`;
    }

    public firstDayOfMonth(value: string | number | Date) {
        return dayjs(value).startOf("month").format("YYYY-MM-DD");
    }

    public lastDayOfMonth(value: string | number | Date) {
        return dayjs(value).endOf("month").format("YYYY-MM-DD");
    }

    public castToEnum(value: any, type: any) {
        if (value == null) {
            return null;
        }
        let e = (<any>type)[value];
        if (!e) {
            throw new BadRequestException(`Invalid Enum key of ${value}, only accept: ` + Object.keys(type).toString().split(",").join(" | "), "INVALID_DATA");
        }
        return e;
    }

    public castToJson(value: any) {
        if (value == null) {
            return null;
        }
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }

    public toFirstUppercase(str: String): string {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    public convertRequestToGetApiParam(req: SRequest, requestMethod: ApiRequestMethod) {
        const selectFields: any = req.query?.['selectedFields']?.toString()?.split(",") || ["*"];
        const excludedFields: any = req.query?.['exclude']?.toString()?.split(",") || [];
        let filters: Filter[] = [];

        // Set Text Filter
        let qF = Object.keys(req.query).filter(f => f.startsWith('tf_'))
        qF.forEach(k => {
            let filter: Filter = { field: "", operator: OperatorEnum.eq, type: FilterType.text, value: "" }
            let field = k.replace(/^(tf_)/, "");
            filter.field = field;
            filter.value = req.query[k];
            let qOP = Object.keys(req.query).find(f => f == `op_${field}`);
            if (qOP) {
                filter.operator = this.castToEnum(req.query[qOP], OperatorEnum);
            }
            qOP = Object.keys(req.query).find(f => f == `type_${field}`);
            if (qOP) {
                filter.type = this.castToEnum(req.query[qOP], FilterType);
            }
            filters.push(filter);

        })
        // Set Date Filter
        qF = Object.keys(req.query).filter(f => f.startsWith('df_'));
        qF.forEach(k => {
            let filter: Filter = { field: "", operator: OperatorEnum.eq, type: FilterType.date, value: "" }
            let field = k.replace(/^(df_)/, "");
            filter.field = field;
            filter.value = req.query[k];
            let qOP = Object.keys(req.query).find(f => f == `op_${field}`);
            if (qOP) {
                filter.operator = this.castToEnum(req.query[qOP], OperatorEnum);
            }
            qOP = Object.keys(req.query).find(f => f == `type_${field}`);
            if (qOP) {
                filter.type = this.castToEnum(req.query[qOP], FilterType);
            }
            filters.push(filter);
        })

        const searchFields: any = req.query?.['searchFields'] || [];

        const page = this.castToJson(req.query?.['page']) || 1
        const limit = this.castToJson(req.query?.['limit']) || 20;
        const tableName = this.convertDocTypeToTableName(req.params?.['docType']);
        const params: ApiParam = {
            user: req.authUser,
            language: req.language || 'en',
            tableName: tableName,
            selectFields: selectFields,
            excludeFields: excludedFields,
            byField: req.params?.['byField'],
            byValue: req.params?.['byValue'],
            method: requestMethod,
            authURL: req.authURL,
            sys: req.sys,
            com: req.com,
            pagination: {
                start: limit * (page - 1),
                limit: limit,
            },
            sorting: {
                sortField: req.query?.['sortField']?.toString(),
                sortBy: this.castToEnum(req.query?.['sortBy']?.toString(), OrderBy) || OrderBy.ASC
            },
            search: {
                searchFields: searchFields,
                searchValue: req.query?.['searchValue']?.toString()
            },
            filters: filters,
            getChild: this.castToJson(req.query?.['getChild']),
            getParent: this.castToJson(req.query?.['getParent']),
            queryParam: req.query

        }
        return params;

    }

    public convertRequestToSaveApiParam(req: SRequest, requestMethod: ApiRequestMethod) {

        const requestBody = req.body?.body ? JSON.parse(req.body?.body) : req.body;
        if (req.params?.['byField']) {
            requestBody[req.params?.['byField']] = req.params?.['byValue']
        }

        const tableName = this.convertDocTypeToTableName(req.params?.['docType']);
        const params: ApiParam = {
            user: req.authUser,
            language: req.language || 'en',
            requestBody: { ...requestBody },
            tableName: tableName,
            byField: req.params?.['byField'],
            byValue: req.params?.['byValue'],
            method: requestMethod,
            authURL: req.authURL,
            queryParam: req.query,
            sys: req.sys,
            com: req.com,
            files: req.files as Express.Multer.File[]
        }
        return params;

    }

    convertDocTypeToTableName(doctype?: string) {
        return doctype?.toLowerCase().replaceAll(' ', '_') || '';
    }
}


