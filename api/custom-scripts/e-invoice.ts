
import { HttpException } from "../../src/api/exceptions/HttpException";
import { ServiceException } from "../../src/api/exceptions/ServiceException";
import { SRequest } from "../../src/api/interfaces/api.route.interface";
import { ApiEInvoiceService, EInvoice, EInvoiceChargeAndDiscount, EinvoiceSetting, EInvoiceTaxPayer } from "../../src/api/services/api.einvoice.service";
import { CoreService } from "../../src/api/services/api.core.service";

const globalService = new CoreService();
const einvoiceService = new ApiEInvoiceService();

export async function submitDocument(req: SRequest) {
    const body = req.body;
    // const inp={
    //     document:"sales_invoice",
    //     documentId:"S0001",
    //     submissionType:"INVOICE" / "CONSOLIDATE_INVOICE",
    //     isSandBox:boolean
    // }

    const eInvoiceSetting = await getEInvoiceSetting(req.com!, body.isSandBox);

    const doc = await globalService.getDocument(body.document, body.documentId);
    switch (body.submissionType) {
        case "INVOICE":
            await validatePartyTinNo("CUSTOMER", doc.customerId, eInvoiceSetting);
            if (!doc) {
                throw new HttpException(400, `Document [${doc.customerId}] is not found`, "DOCUMENT_NOT_FOUND");
            }
            const eInvoiceStatus = eInvoiceSetting.isSandBox ? doc.eInvoiceStatusSandbox : doc.eInvoiceStatus
            if (eInvoiceStatus.toUpperCase == 'VALID') {
                throw new HttpException(400, 'Document has submitted before.', "DOCUMENT_ALREADY_SUBMITTED");
            }

            const invoice: EInvoice = {
                isConsolidate: false,
                invoiceDateTime: doc.postingDate,
                invoiceId: doc.id,
                roundingAdjustment: doc.roundingAmount,
                chargesAndDiscounts: getChargeAndDiscount(paymentTotal),
                items: populateEInvoiceItem(item, paymentTotal.filter(p => p.type == 'TAX'), eInvoiceSetting),
                customer: data.customer,
                supplier: populateSupplier(eInvoiceSetting)
            }

            //     const res: any = await einvoice.submitInvoices(invoice, eInvoiceSetting.eInvoiceId, eInvoiceSetting.eInvoiceSecret, eInvoiceSetting.isSandBox, param.company, "INVOICE");
            //     const htmlDoc = res.validDocument?.htmlDoc ? `${res.validDocument?.htmlDoc}` : '';
            //     await saveEInvoiceSumission([payment.paymentRef], res, invoice, "INVOICE");
            //     if (res.response?.overallStatus == 'Valid') {
            //         res['htmlDoc'] = htmlDoc;
            //         return res;
            //     } else {
            //         let errorMessage = '';
            //         if (res.response.error) {
            //             if (typeof res.response.error == "string") {
            //                 errorMessage = res.response.error;
            //             } else {
            //                 if (res.response.error.details && res.response.error.details.length > 0) {
            //                     errorMessage = `Document has been rejected by LHDN:`;
            //                     for (const d of res.response.error.details) {
            //                         errorMessage = `${errorMessage}\n-${d.message}`;
            //                     }
            //                 }
            //             }


            //         }
            //         if (res.response.rejectedDocuments?.length > 0) {
            //             errorMessage = `Document has been rejected by LHDN:`;
            //             for (const d of res.response.rejectedDocuments[0].error.details) {
            //                 errorMessage = `${errorMessage}\n-${d.message}`;
            //             }
            //         }
            //         throw new HttpException(400, errorMessage);
            //     }
            break;
    }
}

async function getEInvoiceSetting(companyId: string, isSandBox: boolean) {
    const company = await globalService.getDocument("Company", companyId);
    const setting: EinvoiceSetting = {
        clientId: isSandBox ? company.eInvoiceIdSandbox : company.eInvoiceId,
        clientSecret: isSandBox ? company.eInvoiceSecretSandbox : company.eInvoiceSecret,
        isSandBox: isSandBox
    }
    if (!setting.clientId || !setting.clientSecret) {
        throw new ServiceException(`Company e-Invoice configuration has not been completed yet.`, "E_INVOICE_NOT_SET");
    }
    if (!company.tinNo) {
        throw new ServiceException(`Company tin number is not set yet.`, "NO_COMPANY_TIN");
    }
    // const taxPayer: EInvoiceTaxPayer = {
    //     idType: company.identificationType,
    //     idValue: company.businessRegNo,
    //     tinNo: company.tinNo
    // }
    // const validateTin = await einvoiceService.validateTaxPayerTin(taxPayer, setting);
    // if (validateTin && validateTin?.status != 200) {
    //     throw new ServiceException(`Company tin no is not valid`, "INVALID_COMPANY_TIN");
    // }
    return setting;
}

async function validatePartyTinNo(partyType: "CUSTOMER" | "SUPPLIER", id: string, setting: EinvoiceSetting) {
    const party = await globalService.getDocument(partyType.toLowerCase(), id);
    const taxPayer: EInvoiceTaxPayer = {
        idType: party.identificationType,
        idValue: party.identificationNo,
        tinNo: party.tinNo
    }
    const validateTin = await einvoiceService.validateTaxPayerTin(taxPayer, setting);
    if (validateTin && validateTin?.status != 200) {
        throw new ServiceException(`${partyType} tin no is not valid`, `INVALID_${partyType}_TIN`);
    }
}

function getChargeAndDiscount(doc: any) {
    const cnd: EInvoiceChargeAndDiscount[] = [];
    for (const c of doc.charges){
         cnd.push({
            amount: c.amount,
            reason: c.remark || '-',
            type: "CHARGE"
        })
    }
    for (const d of doc.discounts){
         cnd.push({
            amount: d.amount,
            reason: d.remark || '-',
            type: "DISCOUNT"
        })
    }
    return cnd;
}