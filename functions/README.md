# Receipt Parser Cloud Function

A Node.js Cloud Function that uses Google Cloud Document AI to parse receipt images and extract structured data.

## Features

- Accepts Base64 encoded receipt images
- Uses Document AI Expense Parser (processor ID: f13785bc24b54649)
- Extracts:
  - `total_amount` - The total amount on the receipt
  - `supplier_name` - The merchant/store name
  - `receipt_date` - The transaction date
  - `currency` - The currency code (MYR, USD, etc.)
  - `line_items` - Individual items on the receipt (if available)

## Prerequisites

1. Google Cloud project with Document AI API enabled
2. Document AI Expense Parser processor created
3. Service account with Document AI permissions

## Setup

1. Install dependencies:
   ```bash
   cd functions
   npm install
   ```

2. Set environment variables (optional):
   ```bash
   export GOOGLE_CLOUD_PROJECT=your-project-id
   export DOCUMENT_AI_LOCATION=us  # or 'eu'
   ```

3. Authenticate:
   ```bash
   gcloud auth application-default login
   # Or use a service account key
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
   ```

## Deployment

### Cloud Functions (Gen 1)
```bash
npm run deploy
```

### Cloud Functions (Gen 2)
```bash
npm run deploy-gen2
```

### Manual deployment
```bash
gcloud functions deploy parseReceipt \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --memory 512MB \
  --timeout 60s \
  --set-env-vars GOOGLE_CLOUD_PROJECT=your-project-id,DOCUMENT_AI_LOCATION=us
```

## Usage

### Request

```bash
curl -X POST https://YOUR_FUNCTION_URL/parseReceipt \
  -H "Content-Type: application/json" \
  -d '{
    "image": "BASE64_ENCODED_IMAGE_STRING",
    "mimeType": "image/jpeg"
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "total_amount": 125.50,
    "supplier_name": "AEON CO. (M) BHD",
    "receipt_date": "2026-01-15",
    "currency": "MYR",
    "line_items": [
      {
        "description": "MILK 1L",
        "quantity": 2,
        "unit_price": 5.90,
        "amount": 11.80
      }
    ],
    "confidence_scores": {
      "total_amount": 0.95,
      "supplier_name": 0.92,
      "receipt_date": 0.98,
      "currency": 0.99
    }
  },
  "raw": {
    "text": "Full extracted text...",
    "entities": [...]
  }
}
```

## Local Testing

Start the local server:
```bash
npm start
```

Then send requests to `http://localhost:8080/parseReceipt`.

## Integration with MyReceipt App

To integrate with the React app, call this function from your frontend:

```typescript
async function parseReceiptImage(base64Image: string): Promise<ParsedReceipt> {
  const response = await fetch('https://YOUR_FUNCTION_URL/parseReceipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: base64Image,
      mimeType: 'image/jpeg',
    }),
  });
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error);
  }
  
  return result.data;
}
```
