
import dayjs from "dayjs";
import { BadRequestException } from "../exceptions/BadRequestException";
import {  DBFilter, DBFilterCondition, DBOption, DBFilterOperator } from "../interfaces/api.main.interface";
import { SRequest } from "../interfaces/api.route.interface";
import { nanoid } from 'nanoid';
export class ConvertUtil {

    public ConvertDBbFilterToWhereQuery(filter: DBFilter) {
        let where = filter && filter.length > 0 ? 'WHERE' : '';
        for (let i = 0; i <= filter.length - 1; i++) {
            if (typeof filter[i] == 'string') {
                where = `${where} ${filter[i]}`;
            } else {
                if (typeof filter[i - 1] == 'object') {
                    where = `${where} and`;
                }
            }

            if (typeof filter[i] == 'object' && !Array.isArray(filter[i])) {
                const obj = filter[i] as DBFilterCondition;

                where = `${where} ${obj.field} ${obj.operator ?? '='} ${this.convertToDataTypeValue(obj.value)}`;
            }

            if (Array.isArray(filter[i])) {
                where = `${where} (`;
                const f = filter[i] as DBFilter;
                for (let j = 0; j <= f.length - 1; j++) {
                    if (typeof f[j] == 'string') {
                        where = `${where} ${f[j]}`;
                    } else {
                        if (typeof f[j - 1] == 'object') {
                            where = `${where} and`;
                        }
                    }
                    if (typeof f[j] == 'object') {
                        const obj = f[j] as DBFilterCondition;
                        where = `${where} ${obj.field} ${obj.operator ?? '='} ${this.convertToDataTypeValue(obj.value)}`;
                    }
                }
                where = `${where} )`;
            }
        }

        return where;
    }

    public convertToDataTypeValue(value: any) {
        if (value instanceof Date) {
            value = `'${dayjs(value).format('YYYY-MM-DD HH:mm:ss')}'`;
        } else {
            value = JSON.stringify(value);
            value = value ? value.replace("'", "''").replace(/"`|`"/g, "`") : 'null';
        }
        return value;
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

    public toCapitalize(str: String): string {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    public convertQueryParamToDBOption(req: SRequest) {
        const fields: any = req.query?.['_fields']?.toString()?.split(",") || ["*"];
        const excFields: any = req.query?.['_exclude']?.toString()?.split(",") || [];
        const search: any = req.query?.['_search'] || '';
        const searchFields: any = req.query?.['_searchFields'] || ['id'];
        const page = this.castToJson(req.query?.['_page']) || 1;
        const limit = this.castToJson(req.query?.['_limit']) || 20;
        const sortField = req.query?.['_sortField'] || '';
        const sortDirection = req.query?.['_sortDirection'] || '';
        const getChild = this.castToJson(req.query?.['_getChild']);
        const getLink = this.castToJson(req.query?.['_getLink']);
        let filter: DBFilter = [];

        const filterFields = Object.keys(req.query).filter(f => !f.startsWith('_') && !f.startsWith('op_') && !f.startsWith('fop_'));

        filterFields.forEach(field => {
            let condition: DBFilterCondition = { field: "", value: "" }
            let fOP = Object.keys(req.query).find(f => f == `fop_${field}`) as DBFilterOperator;
            if (fOP && filter.length > 0) {
                filter.push(fOP);
            } else {
                let qOP = Object.keys(req.query).find(f => f == `op_${field}`);
                if (qOP) {
                    condition.operator = req.query[qOP] as DBFilterCondition["operator"];
                } else {
                    condition.field = field;
                    condition.value = req.query[field];
                }
                filter.push(condition);
            }
        })

        let options: DBOption = {
            excludeFields: excFields,
            search: search,
            searchFields: searchFields,
            fields: fields,
            filter: filter,
            getChild: getChild,
            getLink: getLink,
            limit: limit,
            offset: (page - 1) * limit,
            sort: `${sortField} ${sortDirection}`.trim()

        }
        console.log(options.filter)
        return options;

        // Set Text Filter
        // let qF = Object.keys(req.query).filter(f => f.startsWith('tf_'))
        // qF.forEach(k => {
        //     let filter: Filter = { field: "", operator: OperatorEnum.eq, type: FilterType.text, value: "" }
        //     let field = k.replace(/^(tf_)/, "");
        //     filter.field = field;
        //     filter.value = req.query[k];
        //     let qOP = Object.keys(req.query).find(f => f == `op_${field}`);
        //     if (qOP) {
        //         filter.operator = this.castToEnum(req.query[qOP], OperatorEnum);
        //     }
        //     qOP = Object.keys(req.query).find(f => f == `type_${field}`);
        //     if (qOP) {
        //         filter.type = this.castToEnum(req.query[qOP], FilterType);
        //     }
        //     filters.push(filter);

        // })
        // // Set Date Filter
        // qF = Object.keys(req.query).filter(f => f.startsWith('df_'));
        // qF.forEach(k => {
        //     let filter: Filter = { field: "", operator: OperatorEnum.eq, type: FilterType.date, value: "" }
        //     let field = k.replace(/^(df_)/, "");
        //     filter.field = field;
        //     filter.value = req.query[k];
        //     let qOP = Object.keys(req.query).find(f => f == `op_${field}`);
        //     if (qOP) {
        //         filter.operator = this.castToEnum(req.query[qOP], OperatorEnum);
        //     }
        //     qOP = Object.keys(req.query).find(f => f == `type_${field}`);
        //     if (qOP) {
        //         filter.type = this.castToEnum(req.query[qOP], FilterType);
        //     }
        //     filters.push(filter);
        // })


        // const document = this.convertDocTypeToTableName(req.params?.['document']);
        // const params: ApiGetParam = {
        //     user: req.authUser,
        //     language: req.language || 'en',
        //     document: document,
        //     selectFields: selectFields,
        //     excludeFields: excludedFields,
        //     sys: req.sys,
        //     com: req.com,
        //     pagination: {
        //         start: limit * (page - 1),
        //         limit: limit,
        //     },
        //     sorting: {
        //         sortField: req.query?.['sortField']?.toString(),
        //         sortBy: this.castToEnum(req.query?.['sortBy']?.toString(), OrderBy) || OrderBy.ASC
        //     },
        //     search: {
        //         searchFields: searchFields,
        //         searchValue: req.query?.['searchValue']?.toString()
        //     },
        //     filters: filters,
        //     getChild: this.castToJson(req.query?.['getChild']),
        //     getParent: this.castToJson(req.query?.['getParent']),
        //     queryParam: req.query,
        //     params: req.params

        // }
        // return params;

    }


    public convertDocTypeToTableName(document?: string) {
        return document?.toLowerCase().replaceAll(' ', '_') || '';
    }

    public hashString(str: string) {
        return Bun.hash(str)
    }

    public deepCopyObject(object: any) {
        return JSON.parse(JSON.stringify(object));
    }

    public generateUniqueId() {
        return nanoid(12);
    }

    public getSQLJsonValueString(field: string, language: string = 'en') {
        return `JSON_UNQUOTE(IF(JSON_VALID(${field} AND JSON_TYPE(${field}) IN ('OBJECT', 'ARRAY')),${field}->'$${language}',${field})) as ${field}`;
    }

    public convertCurrencyToText(amount: string, style: "UPPERCSSE" | "LOWERCASE" | 'CAPITALIZE' = 'CAPITALIZE'): string {
        // A lookup table for numbers 0-19 and tens
        const units = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const tens = [
            '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
        ];
        const scales = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

        // This helper function converts a number up to 999 into words.
        const convertHundreds = (num: number): string => {
            let result = '';

            // Handle the hundreds part
            if (Math.floor(num / 100) > 0) {
                result += units[Math.floor(num / 100)] + ' hundred';
                num %= 100; // Get the remainder
            }

            // Handle the tens and units part (0-99)
            if (num > 0) {
                if (result !== '') {
                    result += ' '; // Add a space if hundreds were present
                }
                if (num < 20) {
                    result += units[num];
                } else {
                    result += tens[Math.floor(num / 10)];
                    if (num % 10 > 0) {
                        result += ' ' + units[num % 10];
                    }
                }
            }
            return result;
        };

        // This main helper function handles numbers of any size.
        const numberToWords = (num: number): string => {
            if (num === 0) {
                return '';
            }

            let words = '';
            let scaleIndex = 0;

            // Process the number in chunks of three digits (e.g., 1,234,567)
            while (num > 0) {
                const chunk = num % 1000;
                if (chunk !== 0) {
                    const chunkWords = convertHundreds(chunk);
                    const scaleWord = scales[scaleIndex];
                    words = chunkWords + (scaleWord ? ' ' + scaleWord : '') + (words ? ' ' + words : '');
                }
                num = Math.floor(num / 1000);
                scaleIndex++;
            }

            return words.trim();
        };

        // --- Main function logic starts here ---
        // Split the amount string into the Ringgit and sen parts
        const [ringgitStr, senStr = '00'] = amount.split('.');

        // Convert the string parts to numbers
        const ringgit = parseInt(ringgitStr, 10);
        const sen = parseInt(senStr.padEnd(2, '0').slice(0, 2), 10);

        // Convert both parts to their word form using the new helper
        const ringgitWords = numberToWords(ringgit);
        const senWords = numberToWords(sen);

        // Build the final string in the specified format
        let res = ringgitWords;
        res = res + (!senWords ? ` Only.` : ` and Sen ${senWords} Only.`)
        // Apply the style transformation
        switch (style) {
            case 'UPPERCSSE':
                res = res.toUpperCase();
                break;
            case 'LOWERCASE':
                res = res.toLowerCase();
                break;
            case 'CAPITALIZE':
                res = res;
                break;
        }
        return res
    }

}


