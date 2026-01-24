import { v1 } from '@google-cloud/documentai';
const { DocumentProcessorServiceClient } = v1;

// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
const LOCATION = process.env.DOCUMENT_AI_LOCATION || 'us';
const PROCESSOR_ID = process.env.PROCESSOR_ID || 'f13785bc24b54649'; // Default to user provided ID

interface ParsedAmount {
    amount: number | null;
    currencyCode: string | null;
}

interface LineItem {
    description: string | null;
    quantity: number | null;
    unit_price: number | null;
    amount: number | null;
}

export interface ReceiptData {
    total_amount: number | null;
    supplier_name: string | null;
    supplier_type: string | null;
    receipt_date: string | null;
    currency: string | null;
    line_items: LineItem[];
    confidence_scores: {
        total_amount?: number;
        supplier_name?: number;
        receipt_date?: number;
        currency?: number;
    };
}

export class ExpenseService {
    private client: v1.DocumentProcessorServiceClient;

    constructor() {
        this.client = new DocumentProcessorServiceClient();
    }

    async parseReceipt(imageBuffer: Buffer, mimeType: string = 'image/jpeg'): Promise<ReceiptData> {
        const name = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;

        const request = {
            name,
            rawDocument: {
                content: imageBuffer,
                mimeType,
            },
        };

        console.log('Processing receipt with Document AI...');
        const [result] = await this.client.processDocument(request);
        const { document } = result;

        if (!document) {
            throw new Error('No document returned from Document AI');
        }

        return this.extractReceiptData(document);
    }

    private extractReceiptData(document: any): ReceiptData {
        const result: ReceiptData = {
            total_amount: null,
            supplier_name: null,
            supplier_type: null,
            receipt_date: null,
            currency: null,
            line_items: [],
            confidence_scores: {},
        };

        if (!document.entities || document.entities.length === 0) {
            return result;
        }

        for (const entity of document.entities) {
            const type = entity.type?.toLowerCase();
            const value = entity.mentionText;
            const normalizedValue = entity.normalizedValue;
            const confidence = entity.confidence || 0;

            switch (type) {
                case 'total_amount':
                case 'total':
                case 'net_amount':
                    if (!result.total_amount || confidence > (result.confidence_scores.total_amount || 0)) {
                        if (normalizedValue?.moneyValue) {
                            const units = Number(normalizedValue.moneyValue.units) || 0;
                            const nanos = normalizedValue.moneyValue.nanos || 0;
                            result.total_amount = units + nanos / 1e9;

                            if (normalizedValue.moneyValue.currencyCode && !result.currency) {
                                result.currency = normalizedValue.moneyValue.currencyCode;
                            }
                        } else {
                            const parsed = this.parseAmount(value);
                            result.total_amount = parsed.amount;
                            if (parsed.currencyCode && !result.currency) {
                                result.currency = parsed.currencyCode;
                            }
                        }
                        result.confidence_scores.total_amount = confidence;
                    }
                    break;

                case 'supplier_name':
                case 'vendor_name':
                case 'merchant_name':
                case 'receiver_name':
                    if (!result.supplier_name || confidence > (result.confidence_scores.supplier_name || 0)) {
                        result.supplier_name = value?.trim() || null;
                        result.confidence_scores.supplier_name = confidence;
                    }
                    break;

                case 'supplier_type':
                case 'merchant_type':
                    result.supplier_type = value?.trim().toLowerCase() || null;
                    break;

                case 'receipt_date':
                case 'transaction_date':
                case 'purchase_date':
                case 'invoice_date':
                    if (!result.receipt_date || confidence > (result.confidence_scores.receipt_date || 0)) {
                        result.receipt_date = normalizedValue?.dateValue
                            ? this.formatDate(normalizedValue.dateValue)
                            : value?.trim() || null;
                        result.confidence_scores.receipt_date = confidence;
                    }
                    break;

                case 'currency':
                    if (!result.currency || confidence > (result.confidence_scores.currency || 0)) {
                        result.currency = value?.trim()?.toUpperCase() || null;
                        result.confidence_scores.currency = confidence;
                    }
                    break;

                case 'line_item':
                    const lineItem = this.extractLineItem(entity);
                    if (lineItem) {
                        result.line_items.push(lineItem);
                    }
                    break;
            }
        }

        // Fallback currency inference
        if (!result.currency && result.total_amount) {
            // Logic handled in extraction above, or default could go here
        }

        return result;
    }

    private parseAmount(amountStr?: string | null): ParsedAmount {
        if (!amountStr) return { amount: null, currencyCode: null };

        const currencyPatterns: Record<string, string> = {
            'RM': 'MYR', 'MYR': 'MYR',
            '$': 'USD', 'USD': 'USD',
            '€': 'EUR', 'EUR': 'EUR',
            '£': 'GBP', 'GBP': 'GBP',
            'S$': 'SGD', 'SGD': 'SGD',
        };

        let currency: string | null = null;
        let cleanAmount = amountStr.toString();

        for (const [symbol, code] of Object.entries(currencyPatterns)) {
            if (cleanAmount.includes(symbol)) {
                currency = code;
                cleanAmount = cleanAmount.replace(symbol, '');
                break;
            }
        }

        const numericMatch = cleanAmount.match(/[\d,]+\.?\d*/);
        const amount = numericMatch
            ? parseFloat(numericMatch[0].replace(/,/g, ''))
            : null;

        return { amount, currencyCode: currency };
    }

    private formatDate(dateValue: any): string | null {
        if (!dateValue) return null;
        const year = dateValue.year || new Date().getFullYear();
        const month = String(dateValue.month || 1).padStart(2, '0');
        const day = String(dateValue.day || 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private extractLineItem(entity: any): LineItem | null {
        const lineItem: LineItem = {
            description: null,
            quantity: null,
            unit_price: null,
            amount: null,
        };

        if (entity.properties && entity.properties.length > 0) {
            for (const prop of entity.properties) {
                const propType = prop.type?.toLowerCase();
                const propValue = prop.mentionText;

                switch (propType) {
                    case 'line_item/description':
                    case 'line_item/product_code':
                        lineItem.description = propValue?.trim() || null;
                        break;
                    case 'line_item/quantity':
                        lineItem.quantity = parseFloat(propValue) || null;
                        break;
                    case 'line_item/unit_price':
                        lineItem.unit_price = this.parseAmount(propValue)?.amount;
                        break;
                    case 'line_item/amount':
                        lineItem.amount = this.parseAmount(propValue)?.amount;
                        break;
                }
            }
        }

        return lineItem.description || lineItem.amount ? lineItem : null;
    }
}
