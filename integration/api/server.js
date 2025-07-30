import express from 'express';
import cors from 'cors';
import SuiFlowPaymentProcessor from './SuiFlowPaymentProcessor.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize payment processor
const processor = new SuiFlowPaymentProcessor();

// Routes

// Get contract statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await processor.getContractStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get payment events
app.get('/api/payments', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const events = await processor.getPaymentEvents(limit);
        
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get admin fee events
app.get('/api/admin-fees', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const events = await processor.getAdminFeeEvents(limit);
        
        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Process payment (for server-side processing)
app.post('/api/process-payment', async (req, res) => {
    try {
        const { merchantAddress, merchantId, productId, paymentCoinId, customerPrivateKey } = req.body;
        
        // Validate required fields
        if (!merchantAddress || !merchantId || !productId || !paymentCoinId || !customerPrivateKey) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Create keypair from private key (in production, handle this more securely)
        const customerKeypair = Ed25519Keypair.fromSecretKey(fromB64(customerPrivateKey));
        
        // Process payment
        const result = await processor.processPayment(
            merchantAddress,
            merchantId,
            productId,
            paymentCoinId,
            customerKeypair
        );
        
        res.json({
            success: true,
            data: {
                transactionDigest: result.digest,
                message: 'Payment processed successfully'
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Withdraw admin fees (admin only)
app.post('/api/withdraw-fees', async (req, res) => {
    try {
        const result = await processor.withdrawAdminFees();
        
        res.json({
            success: true,
            data: {
                transactionDigest: result.digest,
                message: 'Admin fees withdrawn successfully'
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get coins for an address
app.get('/api/coins/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const coins = await processor.getCoins(address);
        
        res.json({
            success: true,
            data: coins
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'SuiFlow Payment API is running',
        timestamp: new Date().toISOString()
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 SuiFlow Payment API running on port ${port}`);
    console.log(`📊 Contract Package ID: ${processor.packageId}`);
    console.log(`🏪 Processor Object ID: ${processor.processorObjectId}`);
});

export default app;
