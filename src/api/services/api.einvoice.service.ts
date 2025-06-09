import * as crypto from "crypto";
import { create } from "apisauce";
import { UnauthorizedException } from "../exceptions/UnauthorizedException";
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc';
// import dayjs from "dayjs";
// import ejs from "ejs";
// import GlobalService from "./global.service";
// import { connectionPool, userId } from "@/databases";
// import { logger } from "@/utils/logger";
// import QRCode from "qrcode";
// import { HttpException } from "@/exceptions/HttpException";

dayjs.extend(utc);

const EINVOICE_SANDBOX_ENV = {
    api: 'https://preprod-api.myinvois.hasil.gov.my',
    portal: 'https://preprod.myinvois.hasil.gov.my'
};

const EINVOICE_PRODUCTION_ENV = {
    api: 'https://api.myinvois.hasil.gov.my',
    portal: 'https://myinvois.hasil.gov.my'
};

const http = create({ baseURL: '', })

// const globalService = new GlobalService;


export class EInvoiceService {

    async getAccessToken(clientId: string, clientSecret: string, isSandBox: boolean) {
        const requestBody = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
            scope: 'InvoicingAPI'
        }).toString();
        http.setHeader('Content-Type', 'application/x-www-form-urlencoded');
        const url = `${this.getEmenuEnvironment(isSandBox).api}/connect/token`;
        const res: any = (await http.post(url, requestBody)).data;
        if (res.error) {
            throw new UnauthorizedException(res.error);
        }
        return `${res['token_type']} ${res['access_token']}`;
    }

    async validateTaxPayerTin(taxPayer: EmenuTaxPayer, clientId: string, clientSecret: string, isSandBox: boolean, token?: string) {
        if (!token) {
            token = await this.getAccessToken(clientId, clientSecret, isSandBox);
        }
        http.setHeader('Content-Type', 'application/json');
        http.setHeader('Authorization', token);
        const url = `${this.getEmenuEnvironment(isSandBox).api}/api/v1.0/taxpayer/validate/${taxPayer.tinNo}`;
        const res: any = (await http.get(url, { IdType: taxPayer.idType, IdValue: taxPayer.idValue })).data;
        return res;
    }

    async getSubmission(submissionUid: string, clientId: string, clientSecret: string, isSandBox: boolean, token?: string) {
        if (!token) {
            token = await this.getAccessToken(clientId, clientSecret, isSandBox);
        }
        http.setHeader('Content-Type', 'application/json');
        http.setHeader('Authorization', token);
        const url = `${this.getEmenuEnvironment(isSandBox).api}/api/v1.0/documentsubmissions/${submissionUid}`;
        const res: any = (await http.get(url)).data;
        return res;
    }

    async getDocument(documentUid: string, clientId: string, clientSecret: string, isSandBox: boolean, token?: string) {
        if (!token) {
            token = await this.getAccessToken(clientId, clientSecret, isSandBox);
        }
        http.setHeader('Content-Type', 'application/json');
        http.setHeader('Authorization', token);
        const env = this.getEmenuEnvironment(isSandBox);
        const url = `${env.api}/api/v1.0/documents/${documentUid}/raw`;
        const res: any = (await http.get(url)).data;
        const validationLink = `${env.portal}/${res.uuid}/share/${res.longID}`;
        const html = await this.convertDocumentToHTML(res, isSandBox, validationLink,)
        return {
            response: res,
            htmlDoc: html,
            validationLink: validationLink
        };
    }

    async submitInvoices(invoice: EInvoice, clientId: string, clientSecret: string, isSandBox: boolean, company: string, submissionType: "INVOICE" | "CONSOLIDATE") {
        const documents = [await this.convertInvoice(invoice)];
        const requestBody = {
            documents
        };
        const log: any = {
            doc_company: company,
            type: submissionType,
            isSandBox: isSandBox,
            invoiceId: invoice.invoiceId,
            request: JSON.stringify(requestBody)
        };

        let submissionRes:any;
        let token;
        try {
            token = await this.getAccessToken(clientId, clientSecret, isSandBox);
            http.setHeader('Content-Type', 'application/json');
            http.setHeader('Authorization', token);
            const url = `${this.getEmenuEnvironment(isSandBox).api}/api/v1.0/documentsubmissions`;
            submissionRes = (await http.post(url, requestBody)).data;
            log['submissionUid'] = submissionRes.submissionUid || null;
        } catch (error:any) {
            log['response'] = JSON.stringify(error) || null;
            log['status'] = "Error";
            throw new Error(error);
        }

        // return res
        let validDoc: any;
        let submission: any;
        try {
            if (submissionRes.submissionUid && submissionRes.acceptedDocuments?.length > 0) {
                let loop = true;
                while (loop) {
                    await new Promise<void>((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, 3000);
                    })
                    submission = await this.getSubmission(submissionRes.submissionUid, clientId, clientSecret, isSandBox, token);
                    if (submission.overallStatus != 'InProgress') {
                        loop = false;
                    }
                }
                if (submission.overallStatus == 'Valid') {
                    const docUid = submissionRes.acceptedDocuments[0].uuid;
                    validDoc = await this.getDocument(docUid, clientId, clientSecret, isSandBox, token);
                    log['validDoc'] = JSON.stringify(validDoc.response);
                    log['htmlDoc'] = validDoc.htmlDoc
                    log['validationLink'] = validDoc.validationLink
                }
                log['status'] = submission.overallStatus;
                log['response'] = JSON.stringify(submission);

            }
        } catch (error) {
            log['response'] = JSON.stringify(error);
            log['status'] = "Error";
        }
        log['response'] = log['response'] || JSON.stringify(submission || submissionRes);

        const keys = Object.keys(log).join(",");
        // const values = globalService.getValue(log);
        // const conn = await connectionPool();
        // try {
        //     const sql = await globalService.insertSql('EInvoice Submission Log', keys, values, 'default', false, userId, false, conn);
        //     conn.query(sql);
        //     return {
        //         response: submission || submissionRes || log['respone'],
        //         validDocument: validDoc,
        //     };
        // } catch (error) {
        //     logger.error(error);
        // } finally {
        //     conn.release();
        // }
    }

    async submitConsolidateInvoice(consolidate: EInvoiceConsolidate, clientId: string, clientSecret: string, isSandBox: boolean, company: string) {
        const customer: EInvoiceCustomer = {
            name: "GENERAL PUBLIC",
            identificationType: "NRIC",
            identificationNo: "NA",
            tinNo: "EI00000000010",
            address: { address1: "NA", city: "", postcode: "", stateCode: "", countryCode: "MYS" },
            contactNo: "NA",
            email: "NA",
            sstRegistration: "NA"
        }
        const currentDateTime = new Date();
        const roundingAdjustment = consolidate.invoices.reduce((i1, i2) => i1 + i2.roundingAdjustment, 0);
        const invoice: EInvoice = {
            invoiceId: dayjs(currentDateTime).format("YYYYMMDDHHmmss"),
            invoiceDateTime: currentDateTime,
            roundingAdjustment: roundingAdjustment,
            chargesAndDiscounts: [],
            supplier: consolidate.supplier,
            customer: customer,
            isConsolidate: true,
            items: consolidate.invoices.map(i => {
                return {
                    name: i.invoiceNo,
                    quantity: 1,
                    sku: '',
                    unitPrice: i.subTotal,
                    subTotal: i.subTotal,
                    uom: '',
                    classfication: '004',
                    chargesAndDiscounts: i.chargesAndDiscounts,
                    taxes: i.taxes,
                }
            })
        }
        return await this.submitInvoices(invoice, clientId, clientSecret, isSandBox, company, "CONSOLIDATE");

    }

    private async convertInvoice(invoice: EInvoice) {
        try {
            const jsonString = JSON.stringify(this.populateInvoiceToUBLJson(invoice)); // convert to E invoice format
            return {
                format: "JSON",
                documentHash: this.sha256(jsonString),
                codeNumber: invoice.invoiceId,
                document: this.base64(jsonString)
            };
        } catch (error:any) {
            throw new Error(error);
        }
    }

    private base64(value:string) {
        return Buffer.from(value, 'utf8').toString('base64');
    }

    private sha256(value:string) {
        return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
    }

    private getEmenuEnvironment(isSandBox: boolean) {
        return isSandBox ? EINVOICE_SANDBOX_ENV : EINVOICE_PRODUCTION_ENV
    }

    private getIssueDateFormat(date: Date) {
        return dayjs(date).utc().format("YYYY-MM-DD");
    }

    private getIssueTimeFormat(date: Date) {
        return dayjs(date).utc().format("HH:mm:ss[Z]");
    }

    private populateInvoiceToUBLJson(invoice: EInvoice) {
        const ublJSON = {
            _D: "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
            _A: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
            _B: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
            Invoice: [{
                ID: [{ _: invoice.invoiceId }],
                IssueDate: [{ _: this.getIssueDateFormat(invoice.invoiceDateTime) }],
                IssueTime: [{ _: this.getIssueTimeFormat(invoice.invoiceDateTime) }],
                InvoiceTypeCode: [{ _: "01", "listVersionID": "1.0" }],
                DocumentCurrencyCode: [{ _: "MYR" }],
                TaxCurrencyCode: [{ _: "MYR" }],
                // InvoicePeriod: ...Optional
                // BillingReference: ...Optional
                // AdditionalDocumentReference: ...Optional
                AccountingSupplierParty: [{
                    AdditionalAccountID: [{ _: "", schemeAgencyName: "CertEx" }],
                    Party: [{
                        IndustryClassificationCode: [{ _: invoice.supplier.industryClassificationCode, name: "" }],
                        PartyIdentification: [
                            { ID: [{ _: invoice.supplier.tinNo, schemeID: "TIN" }] },
                            { ID: [{ _: invoice.supplier.businessResgistrationNo, schemeID: invoice.supplier.identificationType }] },
                            { ID: [{ _: invoice.supplier.sstRegistration || '-', schemeID: "SST" }] }
                        ],
                        PostalAddress: [{
                            CityName: [{ _: invoice.supplier.address.city }],
                            PostalZone: [{ _: invoice.supplier.address.postcode }],
                            CountrySubentityCode: [{ _: invoice.supplier.address.stateCode }],
                            AddressLine: [
                                { Line: [{ _: invoice.supplier.address.address1 || '' }] },
                                { Line: [{ _: invoice.supplier.address.address2 || '' }] },
                                { Line: [{ _: invoice.supplier.address.address3 || '' }] },
                            ],
                            Country: [{
                                IdentificationCode: [{
                                    _: invoice.supplier.address.countryCode,
                                    listID: "ISO3166-1",
                                    listAgencyID: "ISO"
                                }]
                            }]
                        }],
                        PartyLegalEntity: [{
                            RegistrationName: [{ _: invoice.supplier.name }]
                        }],
                        Contact: [{
                            Telephone: [{ _: invoice.supplier.contactNo }],
                            ElectronicMail: [{ _: invoice.supplier.email }]
                        }],
                    }]
                }],

                AccountingCustomerParty: [{
                    Party: [{
                        PartyIdentification: [
                            { ID: [{ _: invoice.customer.tinNo, schemeID: "TIN" }] },
                            { ID: [{ _: invoice.customer.identificationNo, schemeID: invoice.customer.identificationType }] },
                            { ID: [{ _: invoice.customer.sstRegistration || '-', schemeID: "SST" }] }
                        ],
                        PostalAddress: [{
                            CityName: [{ _: invoice.customer.address.city }],
                            PostalZone: [{ _: invoice.customer.address.postcode }],
                            CountrySubentityCode: [{ _: invoice.customer.address.stateCode }],
                            AddressLine: [
                                { Line: [{ _: invoice.customer.address.address1 || '' }] },
                                { Line: [{ _: invoice.customer.address.address2 || '' }] },
                                { Line: [{ _: invoice.customer.address.address3 || '' }] },
                            ],
                            Country: [{
                                IdentificationCode: [{
                                    _: invoice.customer.address.countryCode,
                                    listID: "ISO3166-1",
                                    listAgencyID: "ISO"
                                }]
                            }]
                        }],
                        PartyLegalEntity: [{
                            RegistrationName: [{ _: invoice.customer.name }]
                        }],
                        Contact: [{
                            Telephone: [{ _: invoice.customer.contactNo }],
                            ElectronicMail: [{ _: invoice.customer.email }]
                        }],
                    }]
                }],
                // Delivery: ... Optional
                // PaymentMeans: ... Optional
                // PaymentTerms: ... Optional
                // PrepaidPayment: ... Optional
                AllowanceCharge: this.populateUBLAllowanceCharge(invoice.chargesAndDiscounts),
                TaxTotal: this.populateUBLTaxTotal(this.getOverallTaxes(invoice.items), true), // To Be Study
                LegalMonetaryTotal: this.populateUBLLegalMonetaryTotal(invoice),

                InvoiceLine: this.populateUBLInvoiceLine(invoice.items, invoice.isConsolidate), // To Be Study
                TaxExchangeRate: [{
                    SourceCurrencyCode: [{ _: "MYR" }],
                    TargetCurrencyCode: [{ _: "MYR" }],
                    CalculationRate: [{ _: 0 }],
                }],
            }]
        }
        return ublJSON;
    }

    private populateUBLInvoiceLine(items: EinvoiceItem[], isConsolidate?: boolean) {
        let index = 0;

        const invoiceLine = items.map(i => {
            index++;
            const changeAndDiscount = this.calculateTotalChargeAndDiscount(i.chargesAndDiscounts);
            if (!i.taxes || i.taxes.length == 0) {
                i.taxes = [{
                    chargeBy: "PERCENTAGE",
                    chargedAmount: 0,
                    chargeRate: 0,
                    name: '',
                    taxType: "06",
                    taxtableAmount: i.subTotal + changeAndDiscount
                }]
            }

            return {
                ID: [{ _: String(index) }],
                InvoicedQuantity: [{
                    _: i.quantity,
                    unitCode: "XPG"
                }],
                Item: [{
                    CommodityClassification: [
                        {
                            ItemClassificationCode: [{
                                _: i.classfication || '022',
                                listID: "CLASS"
                            },]
                        },

                    ],
                    Description: [{ _: i.name }]
                }],
                ItemPriceExtension: [{
                    Amount: [{
                        _: i.subTotal,
                        currencyID: "MYR"
                    }]
                }],
                LineExtensionAmount: [{
                    _: i.subTotal + changeAndDiscount,
                    currencyID: "MYR"
                }],
                Price: [{
                    PriceAmount: [{
                        _: i.unitPrice,
                        currencyID: "MYR"
                    }]
                }],
                TaxTotal: this.populateUBLTaxTotal(i.taxes),
                AllowanceCharge: this.populateUBLAllowanceCharge(i.chargesAndDiscounts),
            }
        })
        return invoiceLine;
    }

    private populateUBLLegalMonetaryTotal(invoice: EInvoice) {
        const itemSubtotal = invoice.items.reduce((a, b) => {
            return a + b.subTotal + this.calculateTotalChargeAndDiscount(b.chargesAndDiscounts);
        }, 0);
        const chargeAmount = this.calculateTotalChargeAndDiscount(invoice.chargesAndDiscounts);

        const taxTotal = invoice.items.reduce((a, b) => {
            return a + b.taxes.reduce((t1, t2) => t1 + t2.chargedAmount, 0);
        }, 0);
        const legalMonetaryTotal = [{
            LineExtensionAmount: [{
                _: itemSubtotal,
                currencyID: "MYR"
            }],
            TaxExclusiveAmount: [{
                _: itemSubtotal + chargeAmount,
                currencyID: "MYR"
            }],
            TaxInclusiveAmount: [{
                _: itemSubtotal + chargeAmount + taxTotal,
                currencyID: "MYR"
            }],
            PayableAmount: [{
                _: itemSubtotal + chargeAmount + taxTotal + invoice.roundingAdjustment,
                currencyID: "MYR"
            }],
            PayableRoundingAmount: [{
                _: invoice.roundingAdjustment,
                currencyID: "MYR"
            }]
        }]
        return legalMonetaryTotal;
    }

    private populateUBLAllowanceCharge(chargesAndDiscounts?: EInvoiceChargeAndDiscount[]) {
        if (!chargesAndDiscounts || chargesAndDiscounts.length == 0) {
            chargesAndDiscounts = [
                { amount: 0, type: "CHARGE", reason: "" },
                { amount: 0, type: "DISCOUNT", reason: "" }
            ]
        }
        return chargesAndDiscounts.map(c => {
            return {
                ChargeIndicator: [{ _: c.type == 'CHARGE' }],
                Amount: [{
                    _: c.amount < 0 ? c.amount * -1 : c.amount,
                    currencyID: "MYR"
                }],
                AllowanceChargeReason: [{ _: c.reason }]
            }
        })
    }

    private populateUBLTaxTotal(taxes: EInvoiceTax[], isOverAll: boolean = false) {
        const total = taxes.reduce((a, b) => a + b.chargedAmount, 0);
        const taxAmount = [{
            _: total,
            currencyID: "MYR"
        }]
        const taxSubtotal = taxes.map(t => {
            const sub:any = {
                TaxableAmount: [{
                    _: t.taxtableAmount,
                    currencyID: "MYR"
                }],
                TaxAmount: [{
                    _: t.chargedAmount,
                    currencyID: "MYR"
                }],
                TaxCategory: [{
                    ID: [{ _: t.taxType }],
                    TaxScheme: [{
                        ID: [{
                            _: "OTH",
                            schemeAgencyID: "6",
                            schemeID: "UN/ECE 5153"
                        }]
                    }]
                }]
            }
            if (!isOverAll) {
                const type = t.chargeBy == 'AMOUNT' ? 'PerUnitAmount' : 'Percent'
                sub[type] = [{ _: t.chargeRate }];
            }
            return sub;
        })

        const taxTotal = [{
            TaxAmount: taxAmount,
            TaxSubtotal: taxSubtotal
        }]
        return taxTotal;
    }

    private getOverallTaxes(items: EinvoiceItem[]) {
        const taxes: EInvoiceTax[] = [];
        for (const i of items) {
            if (!i.taxes || i.taxes.length == 0) {
                taxes.push({
                    chargeBy: "PERCENTAGE",
                    chargedAmount: 0,
                    chargeRate: 0,
                    name: '',
                    taxType: '06',
                    taxtableAmount: i.subTotal + this.calculateTotalChargeAndDiscount(i.chargesAndDiscounts)
                })
            } else {
                for (const t of i.taxes) {
                    const tax = taxes.find(tx => tx.taxType == t.taxType);
                    if (tax) {
                        tax.chargedAmount = tax.chargedAmount + t.chargedAmount;
                        tax.taxtableAmount = tax.taxtableAmount + t.taxtableAmount;
                    } else {
                        taxes.push({ ...t });
                    }
                }
            }


        }
        return taxes;
    }

    private calculateTotalChargeAndDiscount(chargesAndDiscounts?: EInvoiceChargeAndDiscount[]) {
        return chargesAndDiscounts?.reduce((a, b) => {
            return a + b.amount * (b.type == "DISCOUNT" && b.amount > 0 ? -1 : 1);
        }, 0) || 0;
    }

    private async convertDocumentToHTML(doc: any, isSandBox: boolean, validationLink?: string) {
        // doc.document = convertUblJson(JSON.parse(doc.document));
        // try {
        //     const validationQR = validationLink ? await QRCode.toDataURL(validationLink) : undefined;
        //     const validateDateTime = moment(doc.dateTimeValidated).format("DD-MM-YYYY hh:mm a");
        //     const invoiceDate = moment(`${doc.document.Invoice.IssueDate} ${doc.document.Invoice.IssueTime}`).format("DD-MM-YYYY hh:mm a")
        //     return await ejs.renderFile(`files/default/e-invoice/invoice.ejs`, { invoice: doc, states: [], validateDateTime: validateDateTime, invoiceDate: invoiceDate, validationQR: validationQR, isSandBox: isSandBox });
        // } catch (e) {
        //     console.error(validationLink, e)
        // }
    }

}

export interface EInvoice {
    invoiceId: string;
    invoiceDateTime: Date;
    supplier: EInvoiceSupplier;
    customer: EInvoiceCustomer;
    items: EinvoiceItem[];
    chargesAndDiscounts?: EInvoiceChargeAndDiscount[];
    roundingAdjustment: number;
    isConsolidate?: boolean
}

export interface EInvoiceConsolidate {
    supplier: EInvoiceSupplier;
    invoices: EInvoiceItemLine[];
}

export interface EInvoiceItemLine {
    invoiceNo: string;
    subTotal: number;
    taxes: EInvoiceTax[];
    chargesAndDiscounts?: EInvoiceChargeAndDiscount[];
    roundingAdjustment: number;
}

export interface EInvoiceSupplier {
    industryClassificationCode: string;
    tinNo: string;
    businessResgistrationNo: string;
    identificationType: string;
    address: EInvoiceAddress;
    name: string;
    contactNo: string;
    email: string;
    sstRegistration?: string;
}

export interface EInvoiceCustomer {
    tinNo: string;
    identificationNo: string;
    identificationType: string;
    address: EInvoiceAddress;
    name: string;
    contactNo: string;
    email: string;
    sstRegistration?: string;
}

export interface EinvoiceItem {
    name: string;
    quantity: number;
    sku: string;
    uom: string;
    classfication: string;
    unitPrice: number;
    subTotal: number;
    taxes: EInvoiceTax[];
    chargesAndDiscounts?: EInvoiceChargeAndDiscount[];
}

interface EInvoiceAddress {
    city: string;
    postcode: string;
    address1: string;
    address2?: string;
    address3?: string;
    stateCode: string;
    countryCode: string;
}

export interface EInvoiceTax {
    name: string;
    taxType: string;
    chargedAmount: number;
    chargeRate: number;
    chargeBy: "PERCENTAGE" | "AMOUNT";
    taxtableAmount: number
}

export interface EInvoiceChargeAndDiscount {
    type: "CHARGE" | "DISCOUNT";
    reason: string;
    amount: number;
}

interface EmenuTaxPayer {
    idType: string;
    idValue: string;
    tinNo: string;
}

function convertUblJson(ublJson: any): any {
    // Check if it's an array
    if (Array.isArray(ublJson)) {
        const map = ublJson.map(j => convertUblJson(j));  // Recursively convert each item in the array
        return map.length == 1 ? map[0] : map;
    }

    // Check if it's an object
    if (typeof ublJson === 'object' && ublJson !== null) {
        const result: any = {};

        // Loop through each key in the object
        for (const key in ublJson) {
            if (ublJson.hasOwnProperty(key)) {
                // If the key is "_" any only, replace it with the value directly
                if (key === '_' && Object.keys(ublJson).length == 1) {
                    return ublJson[key];
                }
                // Recursively convert nested objects/arrays

                result[key] = convertUblJson(ublJson[key]);
            }
        }
        return result;
    }

    // If it's a primitive value, return it as is
    return ublJson;
}
