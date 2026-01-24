import express from 'express';
import { ExpenseService } from './ExpenseService';

const app = express();
const expenseService = new ExpenseService();

app.use(express.json({ limit: '10mb' }));

app.post('/api/parse-receipt', async (req: express.Request, res: express.Response) => {
    try {
        const { image, mimeType } = req.body;

        if (!image) {
            res.status(400).json({ success: false, error: 'Missing image data' });
            return;
        }

        // Convert base64 to buffer
        const imageBuffer = Buffer.from(image, 'base64');
        const result = await expenseService.parseReceipt(imageBuffer, mimeType || 'image/jpeg');

        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error('Error in parse-receipt:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Expose access via standard Node port for local dev or GCF
const PORT = process.env.PORT || 8080;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

export const parseReceipt = app;
