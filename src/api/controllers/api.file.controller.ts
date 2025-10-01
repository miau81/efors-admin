import type { NextFunction, Response } from "express";
import { SRequest } from "../interfaces/api.route.interface";
import puppeteer from 'puppeteer';
import { BadRequestException } from "../exceptions/BadRequestException";
export class ApiFileController {



    public generatePdf = async (req: SRequest, res: Response, next: NextFunction) => {
       try {
            const body = req.body;
            if (!body.html) {
                throw new BadRequestException("No HTML found");
            }
            const browser = await puppeteer.launch({
                headless: true, // or false for debugging
                args: ['--no-sandbox', '--disable-setuid-sandbox','--remote-debugging-port=9222'],
            });

            const page = await browser.newPage();
            await page.setContent(body.html, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: '10mm',
                    bottom: '10mm',
                    left: '10mm',
                    right: '10mm'
                },
                ...(body.options || {})
            });
            await browser.close();
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="export.pdf"',
            });
            res.end(pdfBuffer);
        } catch (error) {
            console.log(error)
            next(error);
        }
    }
}