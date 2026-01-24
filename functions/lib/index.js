"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReceipt = void 0;
const express_1 = __importDefault(require("express"));
const ExpenseService_1 = require("./ExpenseService");
const app = (0, express_1.default)();
const expenseService = new ExpenseService_1.ExpenseService();
app.use(express_1.default.json({ limit: '10mb' }));
app.post('/api/parse-receipt', async (req, res) => {
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
    }
    catch (error) {
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
exports.parseReceipt = app;
//# sourceMappingURL=index.js.map