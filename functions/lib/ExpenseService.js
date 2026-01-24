"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseService = void 0;
const documentai_1 = require("@google-cloud/documentai");
const { DocumentProcessorServiceClient } = documentai_1.v1;
// Configuration
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
const LOCATION = process.env.DOCUMENT_AI_LOCATION || 'us';
const PROCESSOR_ID = process.env.PROCESSOR_ID || 'f13785bc24b54649'; // Default to user provided ID
class ExpenseService {
    constructor() {
        this.client = new DocumentProcessorServiceClient();
    }
    async parseReceipt(imageBuffer, mimeType = 'image/jpeg') {
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
    extractReceiptData(document) {
        var _a, _b;
        const result = {
            total_amount: null,
            supplier_name: null,
            receipt_date: null,
            currency: null,
            line_items: [],
            confidence_scores: {},
        };
        if (!document.entities || document.entities.length === 0) {
            return result;
        }
        for (const entity of document.entities) {
            const type = (_a = entity.type) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            const value = entity.mentionText;
            const normalizedValue = entity.normalizedValue;
            const confidence = entity.confidence || 0;
            switch (type) {
                case 'total_amount':
                case 'total':
                case 'net_amount':
                    if (!result.total_amount || confidence > (result.confidence_scores.total_amount || 0)) {
                        if (normalizedValue === null || normalizedValue === void 0 ? void 0 : normalizedValue.moneyValue) {
                            const units = Number(normalizedValue.moneyValue.units) || 0;
                            const nanos = normalizedValue.moneyValue.nanos || 0;
                            result.total_amount = units + nanos / 1e9;
                            if (normalizedValue.moneyValue.currencyCode && !result.currency) {
                                result.currency = normalizedValue.moneyValue.currencyCode;
                            }
                        }
                        else {
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
                        result.supplier_name = (value === null || value === void 0 ? void 0 : value.trim()) || null;
                        result.confidence_scores.supplier_name = confidence;
                    }
                    break;
                case 'receipt_date':
                case 'transaction_date':
                case 'purchase_date':
                case 'invoice_date':
                    if (!result.receipt_date || confidence > (result.confidence_scores.receipt_date || 0)) {
                        result.receipt_date = (normalizedValue === null || normalizedValue === void 0 ? void 0 : normalizedValue.dateValue)
                            ? this.formatDate(normalizedValue.dateValue)
                            : (value === null || value === void 0 ? void 0 : value.trim()) || null;
                        result.confidence_scores.receipt_date = confidence;
                    }
                    break;
                case 'currency':
                    if (!result.currency || confidence > (result.confidence_scores.currency || 0)) {
                        result.currency = ((_b = value === null || value === void 0 ? void 0 : value.trim()) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || null;
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
    parseAmount(amountStr) {
        if (!amountStr)
            return { amount: null, currencyCode: null };
        const currencyPatterns = {
            'RM': 'MYR', 'MYR': 'MYR',
            '$': 'USD', 'USD': 'USD',
            '€': 'EUR', 'EUR': 'EUR',
            '£': 'GBP', 'GBP': 'GBP',
            'S$': 'SGD', 'SGD': 'SGD',
        };
        let currency = null;
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
    formatDate(dateValue) {
        if (!dateValue)
            return null;
        const year = dateValue.year || new Date().getFullYear();
        const month = String(dateValue.month || 1).padStart(2, '0');
        const day = String(dateValue.day || 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    extractLineItem(entity) {
        var _a, _b, _c;
        const lineItem = {
            description: null,
            quantity: null,
            unit_price: null,
            amount: null,
        };
        if (entity.properties && entity.properties.length > 0) {
            for (const prop of entity.properties) {
                const propType = (_a = prop.type) === null || _a === void 0 ? void 0 : _a.toLowerCase();
                const propValue = prop.mentionText;
                switch (propType) {
                    case 'line_item/description':
                    case 'line_item/product_code':
                        lineItem.description = (propValue === null || propValue === void 0 ? void 0 : propValue.trim()) || null;
                        break;
                    case 'line_item/quantity':
                        lineItem.quantity = parseFloat(propValue) || null;
                        break;
                    case 'line_item/unit_price':
                        lineItem.unit_price = (_b = this.parseAmount(propValue)) === null || _b === void 0 ? void 0 : _b.amount;
                        break;
                    case 'line_item/amount':
                        lineItem.amount = (_c = this.parseAmount(propValue)) === null || _c === void 0 ? void 0 : _c.amount;
                        break;
                }
            }
        }
        return lineItem.description || lineItem.amount ? lineItem : null;
    }
}
exports.ExpenseService = ExpenseService;
//# sourceMappingURL=ExpenseService.js.map