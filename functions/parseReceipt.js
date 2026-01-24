const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;

// Initialize the Document AI client
const client = new DocumentProcessorServiceClient();

// Configuration - Update these with your actual values
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'your-project-id';
const LOCATION = process.env.DOCUMENT_AI_LOCATION || 'us'; // or 'eu'
const PROCESSOR_ID = 'f13785bc24b54649'; // Your Expense Parser processor ID

/**
 * Cloud Function to parse receipt images using Document AI Expense Parser
 * 
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * 
 * Expected request body:
 * {
 *   "image": "base64_encoded_image_string",
 *   "mimeType": "image/jpeg" // optional, defaults to image/jpeg
 * }
 */
exports.parseReceipt = async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
    }

    try {
        const { image, mimeType = 'image/jpeg' } = req.body;

        // Validate input
        if (!image) {
            res.status(400).json({
                error: 'Missing required field: image (Base64 encoded)'
            });
            return;
        }

        // Build the processor name
        const processorName = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;

        // Create the request for Document AI
        const request = {
            name: processorName,
            rawDocument: {
                content: image, // Base64-encoded image
                mimeType: mimeType,
            },
        };

        // Process the document
        console.log('Processing receipt with Document AI...');
        const [result] = await client.processDocument(request);
        const { document } = result;

        // Extract the entities we need
        const extractedData = extractReceiptData(document);

        // Return the structured response
        res.status(200).json({
            success: true,
            data: extractedData,
            raw: {
                text: document.text,
                entities: document.entities?.map(e => ({
                    type: e.type,
                    mentionText: e.mentionText,
                    normalizedValue: e.normalizedValue,
                    confidence: e.confidence,
                })),
            },
        });

    } catch (error) {
        console.error('Error processing receipt:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.details || 'Failed to process receipt',
        });
    }
};

/**
 * Extract specific fields from the Document AI response
 * @param {Object} document - The processed document from Document AI
 * @returns {Object} Extracted receipt data
 */
function extractReceiptData(document) {
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
        const type = entity.type?.toLowerCase();
        const value = entity.mentionText;
        const normalizedValue = entity.normalizedValue;
        const confidence = entity.confidence;

        switch (type) {
            case 'total_amount':
            case 'total':
            case 'net_amount':
                if (!result.total_amount || confidence > result.confidence_scores.total_amount) {
                    result.total_amount = normalizedValue?.moneyValue
                        ? {
                            amount: parseFloat(normalizedValue.moneyValue.units || 0) +
                                parseFloat(normalizedValue.moneyValue.nanos || 0) / 1e9,
                            currencyCode: normalizedValue.moneyValue.currencyCode,
                        }
                        : parseAmount(value);
                    result.confidence_scores.total_amount = confidence;

                    // Also extract currency from money value if available
                    if (normalizedValue?.moneyValue?.currencyCode && !result.currency) {
                        result.currency = normalizedValue.moneyValue.currencyCode;
                    }
                }
                break;

            case 'supplier_name':
            case 'vendor_name':
            case 'merchant_name':
            case 'receiver_name':
                if (!result.supplier_name || confidence > result.confidence_scores.supplier_name) {
                    result.supplier_name = value?.trim();
                    result.confidence_scores.supplier_name = confidence;
                }
                break;

            case 'receipt_date':
            case 'transaction_date':
            case 'purchase_date':
            case 'invoice_date':
                if (!result.receipt_date || confidence > result.confidence_scores.receipt_date) {
                    result.receipt_date = normalizedValue?.dateValue
                        ? formatDate(normalizedValue.dateValue)
                        : value?.trim();
                    result.confidence_scores.receipt_date = confidence;
                }
                break;

            case 'currency':
                if (!result.currency || confidence > result.confidence_scores.currency) {
                    result.currency = value?.trim()?.toUpperCase();
                    result.confidence_scores.currency = confidence;
                }
                break;

            case 'line_item':
                // Handle line items if present
                const lineItem = extractLineItem(entity);
                if (lineItem) {
                    result.line_items.push(lineItem);
                }
                break;
        }
    }

    // Try to infer currency from total_amount if not found
    if (!result.currency && result.total_amount?.currencyCode) {
        result.currency = result.total_amount.currencyCode;
    }

    // Format final total_amount as a number
    if (result.total_amount && typeof result.total_amount === 'object') {
        result.total_amount = result.total_amount.amount;
    }

    return result;
}

/**
 * Parse amount string to extract numeric value
 * @param {string} amountStr - Amount string like "RM 125.50" or "$99.99"
 * @returns {Object} Parsed amount with value and currency
 */
function parseAmount(amountStr) {
    if (!amountStr) return null;

    // Remove common currency symbols and whitespace
    const currencyPatterns = {
        'RM': 'MYR',
        'MYR': 'MYR',
        '$': 'USD',
        'USD': 'USD',
        '€': 'EUR',
        'EUR': 'EUR',
        '£': 'GBP',
        'GBP': 'GBP',
        'S$': 'SGD',
        'SGD': 'SGD',
    };

    let currency = null;
    let cleanAmount = amountStr.toString();

    // Find and extract currency
    for (const [symbol, code] of Object.entries(currencyPatterns)) {
        if (cleanAmount.includes(symbol)) {
            currency = code;
            cleanAmount = cleanAmount.replace(symbol, '');
            break;
        }
    }

    // Extract numeric value
    const numericMatch = cleanAmount.match(/[\d,]+\.?\d*/);
    const amount = numericMatch
        ? parseFloat(numericMatch[0].replace(/,/g, ''))
        : null;

    return { amount, currencyCode: currency };
}

/**
 * Format date object to ISO string
 * @param {Object} dateValue - Date value from Document AI
 * @returns {string} Formatted date string
 */
function formatDate(dateValue) {
    if (!dateValue) return null;

    const year = dateValue.year || new Date().getFullYear();
    const month = String(dateValue.month || 1).padStart(2, '0');
    const day = String(dateValue.day || 1).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Extract line item details from entity
 * @param {Object} entity - Line item entity
 * @returns {Object} Extracted line item
 */
function extractLineItem(entity) {
    const lineItem = {
        description: null,
        quantity: null,
        unit_price: null,
        amount: null,
    };

    // Check for nested properties
    if (entity.properties && entity.properties.length > 0) {
        for (const prop of entity.properties) {
            const propType = prop.type?.toLowerCase();
            const propValue = prop.mentionText;

            switch (propType) {
                case 'line_item/description':
                case 'line_item/product_code':
                    lineItem.description = propValue?.trim();
                    break;
                case 'line_item/quantity':
                    lineItem.quantity = parseFloat(propValue) || null;
                    break;
                case 'line_item/unit_price':
                    lineItem.unit_price = parseAmount(propValue)?.amount;
                    break;
                case 'line_item/amount':
                    lineItem.amount = parseAmount(propValue)?.amount;
                    break;
            }
        }
    }

    return lineItem.description || lineItem.amount ? lineItem : null;
}

// For local testing
if (require.main === module) {
    const express = require('express');
    const app = express();
    app.use(express.json({ limit: '10mb' }));

    app.post('/parseReceipt', (req, res) => {
        exports.parseReceipt(req, res);
    });

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Receipt parser listening on port ${PORT}`);
    });
}
