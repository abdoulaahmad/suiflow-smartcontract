# SuiFlow Smart Contract Integration

A comprehensive JavaScript/TypeScript SDK for integrating with the SuiFlow payment processor smart contract on the Sui blockchain.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Sui wallet (for testing payments)
- Testnet SUI tokens

### Installation

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your contract details
```

### Environment Configuration

Create a `.env` file with your deployed contract details:

```env
PACKAGE_ID=0xce43cd5a753080bb1546a3b575ca48892204699b580d89df5f384ca77da4641a0
PROCESSOR_OBJECT_ID=0x33baa75593ccc45a8edd06798ff6f0319d43287968590a90c3c593ff55b23574
ADMIN_ADDRESS=0x3ae1c107dfb3bf8f1c57932c7ab5d47f65330973bd95b2af702cbea6bc2a0f28
NETWORK=testnet
RPC_URL=https://fullnode.testnet.sui.io:443
```

### Basic Usage

```javascript
import SuiFlowPaymentProcessor from './SuiFlowPaymentProcessor.js';

// Initialize the processor
const processor = new SuiFlowPaymentProcessor();

// Get contract statistics
const stats = await processor.getContractStats();
console.log('Admin:', stats.adminAddress);
console.log('Total Payments:', stats.totalPaymentsProcessed);
console.log('Fees Collected:', stats.totalFeesCollected);
```

## 📋 Contract Details

### Deployed Contract Information

- **Package ID**: `0xce43cd5a753080bb1546a3b575ca48892204699b580d89df5f384ca77da4641a0`
- **Processor Object**: `0x33baa75593ccc45a8edd06798ff6f0319d43287968590a90c3c593ff55b23574`
- **Network**: Sui Testnet
- **Admin Address**: `0x3ae1c107dfb3bf8f1c57932c7ab5d47f65330973bd95b2af702cbea6bc2a0f28`
- **Admin Fee**: 0.01 SUI (10,000,000 MIST) per transaction

### Smart Contract Functions

- `process_widget_payment`: Process a payment with automatic admin fee deduction
- `withdraw_admin_fees`: Withdraw accumulated admin fees (admin only)
- `get_admin_address`: Get the contract admin address
- `get_total_fees_collected`: Get total admin fees collected
- `get_total_payments_processed`: Get total number of payments processed

## 🛠 API Reference

### SuiFlowPaymentProcessor Class

#### Constructor

```javascript
const processor = new SuiFlowPaymentProcessor(privateKey?: string)
```

- `privateKey` (optional): Ed25519 private key for signing transactions

#### Methods

##### `getContractStats()`

Get current contract statistics.

```javascript
const stats = await processor.getContractStats();
// Returns: { adminAddress, totalFeesCollected, totalPaymentsProcessed }
```

##### `processPayment(merchantAddress, merchantId, productId, paymentCoinId)`

Process a payment through the smart contract.

```javascript
const result = await processor.processPayment(
    '0x123...', // merchant address
    'merchant_001', // merchant ID
    'product_456', // product ID  
    '0xabc...' // payment coin object ID
);
```

##### `withdrawAdminFees()`

Withdraw accumulated admin fees (admin only).

```javascript
const result = await processor.withdrawAdminFees();
```

##### `getPaymentEvents(limit)`

Get recent payment events.

```javascript
const events = await processor.getPaymentEvents(10);
```

## 🧪 Testing

### Run Basic Connectivity Test

```bash
node test-basic.js
```

Expected output:
```
✅ Processor initialized
   Package ID: 0xce43cd5a753080bb1546a3b575ca48892...
   Processor Object: 0x33baa75593ccc45a8edd06798ff6f0319d...

✅ Contract stats retrieved:
   Admin Address: 0x3ae1c107dfb3bf8f1c57932c7ab5d47f65330973...
   Total Payments: 0
   Fees Collected: 0 MIST

🎉 Integration test successful!
```

### Run Integration Example

```bash
node example.js
```

Expected output for a new contract:
```
=== SuiFlow Payment Processor Integration Example ===

1. Getting contract statistics...
Contract Stats: {
  adminAddress: '0x3ae1c107dfb3bf8f1c57932c7ab5d47f65330973...',
  totalFeesCollected: '0',
  totalPaymentsProcessed: '0'
}

2. Getting recent payment events...
No payment events found yet (this is normal for a new contract)
Found 0 recent payment events:

3. Getting admin fee withdrawal events...
No admin fee withdrawal events found yet (this is normal for a new contract)
Found 0 admin fee events:

✅ Integration example completed successfully!
```

### Run Payment Flow Test

```bash
node test-payment.js
```

### Run Full Integration Test

```bash
node test-integration.js
```

## 💻 Integration Examples

### React Component Integration

```jsx
import React, { useState, useEffect } from 'react';
import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import SuiFlowPaymentProcessor from '../SuiFlowPaymentProcessor.js';

function PaymentWidget({ merchantId, productId, amount }) {
    const wallet = useWallet();
    const [processor, setProcessor] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (wallet.connected) {
            const proc = new SuiFlowPaymentProcessor();
            setProcessor(proc);
        }
    }, [wallet.connected]);

    const handlePayment = async () => {
        if (!processor || !wallet.account) return;
        
        setIsProcessing(true);
        try {
            // Implementation depends on your payment coin selection logic
            const paymentCoinId = await selectPaymentCoin(amount);
            
            const result = await processor.processPayment(
                wallet.account.address,
                merchantId,
                productId,
                paymentCoinId
            );
            
            console.log('Payment successful:', result);
            // Handle success
        } catch (error) {
            console.error('Payment failed:', error);
            // Handle error
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="payment-widget">
            <h3>SuiFlow Payment</h3>
            <p>Amount: {amount / 1000000000} SUI</p>
            <p>Product: {productId}</p>
            
            {!wallet.connected ? (
                <ConnectButton />
            ) : (
                <button 
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="payment-button"
                >
                    {isProcessing ? 'Processing...' : 'Pay with SUI'}
                </button>
            )}
        </div>
    );
}

export default PaymentWidget;
```

### Express.js API Integration

```javascript
import express from 'express';
import SuiFlowPaymentProcessor from './SuiFlowPaymentProcessor.js';

const app = express();
app.use(express.json());

const processor = new SuiFlowPaymentProcessor();

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

// Process payment
app.post('/api/process-payment', async (req, res) => {
    try {
        const { merchantAddress, merchantId, productId, paymentCoinId } = req.body;
        
        const result = await processor.processPayment(
            merchantAddress,
            merchantId,
            productId,
            paymentCoinId
        );
        
        res.json({
            success: true,
            transactionDigest: result.digest,
            data: result
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
        const limit = req.query.limit || 10;
        const events = await processor.getPaymentEvents(parseInt(limit));
        
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

app.listen(3000, () => {
    console.log('SuiFlow API server running on port 3000');
});
```

### CLI Integration

For command-line integration, use the provided bash script:

```bash
# Source the integration script
source cli_integration.sh

# Process a payment
process_payment "0x123..." "merchant_001" "product_456" "0xabc..."

# Withdraw admin fees (admin only)
withdraw_admin_fees

# Get contract statistics
get_stats
```

## 📊 Monitoring and Analytics

### Contract Statistics

Monitor your contract performance:

```javascript
const processor = new SuiFlowPaymentProcessor();

async function getAnalytics() {
    const stats = await processor.getContractStats();
    
    console.log('📊 SuiFlow Analytics');
    console.log('===================');
    console.log('Total Payments:', stats.totalPaymentsProcessed);
    console.log('Fees Collected:', (stats.totalFeesCollected / 1000000000).toFixed(4), 'SUI');
    console.log('Admin Address:', stats.adminAddress);
    
    // Calculate average fee per payment
    if (stats.totalPaymentsProcessed > 0) {
        const avgFee = stats.totalFeesCollected / stats.totalPaymentsProcessed;
        console.log('Average Fee:', (avgFee / 1000000000).toFixed(4), 'SUI');
    }
}

// Run analytics every hour
setInterval(getAnalytics, 3600000);
```

### Event Monitoring

Monitor payment events in real-time:

```javascript
async function monitorPayments() {
    const processor = new SuiFlowPaymentProcessor();
    
    while (true) {
        try {
            const events = await processor.getPaymentEvents(5);
            
            events.forEach(event => {
                console.log('💰 New Payment:');
                console.log('  Merchant:', event.data.merchant_id);
                console.log('  Product:', event.data.product_id);
                console.log('  Amount:', event.data.net_amount, 'MIST');
                console.log('  Fee:', event.data.admin_fee, 'MIST');
                console.log('  Time:', new Date(event.timestampMs));
            });
            
            // Wait 30 seconds before next check
            await new Promise(resolve => setTimeout(resolve, 30000));
        } catch (error) {
            console.error('Error monitoring payments:', error);
            await new Promise(resolve => setTimeout(resolve, 60000));
        }
    }
}

monitorPayments();
```

## 🔧 Configuration

### Network Configuration

Switch between Sui networks:

```javascript
// Testnet (default)
const processor = new SuiFlowPaymentProcessor();

// Mainnet
process.env.NETWORK = 'mainnet';
process.env.RPC_URL = 'https://fullnode.mainnet.sui.io:443';
const mainnetProcessor = new SuiFlowPaymentProcessor();

// Local development
process.env.NETWORK = 'localnet';
process.env.RPC_URL = 'http://127.0.0.1:9000';
const localProcessor = new SuiFlowPaymentProcessor();
```

### Custom RPC Configuration

```javascript
import { SuiClient } from '@mysten/sui.js/client';

const customClient = new SuiClient({ 
    url: 'https://your-custom-rpc-endpoint.com' 
});

const processor = new SuiFlowPaymentProcessor();
processor.client = customClient; // Override the default client
```

## 🐛 Troubleshooting

### Common Issues

#### "No payment events found yet (this is normal for a new contract)"
This message appears when querying events from a newly deployed contract that hasn't processed any payments yet. This is expected behavior.

#### "Invalid params" error when querying events
This typically happens when:
- The contract hasn't emitted any events of the requested type yet
- The event type name doesn't match the contract's event definitions
- The package ID is incorrect

#### "MODULE_NOT_FOUND" errors
Check that:
- All required dependencies are installed: `npm install`
- The `.env` file exists and contains correct values
- Object IDs are exactly 66 characters long (excluding '0x' prefix)

#### Connection timeouts or RPC errors
- Verify your internet connection
- Check if the RPC endpoint is accessible
- Try switching to a different RPC endpoint
- For testnet: `https://fullnode.testnet.sui.io:443`

### Debug Mode

Enable debug logging:

```javascript
// Add this before initializing the processor
process.env.DEBUG = 'true';

const processor = new SuiFlowPaymentProcessor();
```

### Verify Contract Deployment

To verify your contract is correctly deployed:

```bash
# Check object exists
sui client object [PROCESSOR_OBJECT_ID] --json

# Check package exists  
sui client object [PACKAGE_ID] --json
```

## 🛡 Security Considerations

### Private Key Management

Never hardcode private keys in your code:

```javascript
// ❌ Bad - hardcoded private key
const processor = new SuiFlowPaymentProcessor('your-private-key-here');

// ✅ Good - use environment variables
const privateKey = process.env.PRIVATE_KEY;
const processor = new SuiFlowPaymentProcessor(privateKey);

// ✅ Better - use secure key management
import { getSecureKey } from './keyManager.js';
const privateKey = await getSecureKey();
const processor = new SuiFlowPaymentProcessor(privateKey);
```

### Input Validation

Always validate inputs:

```javascript
function validatePaymentRequest(merchantAddress, merchantId, productId, amount) {
    if (!merchantAddress || !merchantAddress.startsWith('0x')) {
        throw new Error('Invalid merchant address');
    }
    
    if (!merchantId || merchantId.length === 0) {
        throw new Error('Merchant ID is required');
    }
    
    if (!productId || productId.length === 0) {
        throw new Error('Product ID is required');
    }
    
    if (!amount || amount <= 0) {
        throw new Error('Amount must be positive');
    }
}
```

### Error Handling

Implement comprehensive error handling:

```javascript
async function safeProcessPayment(merchantAddress, merchantId, productId, paymentCoinId) {
    try {
        const result = await processor.processPayment(
            merchantAddress,
            merchantId,
            productId,
            paymentCoinId
        );
        
        return { success: true, result };
    } catch (error) {
        console.error('Payment processing error:', error);
        
        // Handle specific error types
        if (error.message.includes('Insufficient balance')) {
            return { success: false, error: 'Insufficient SUI balance' };
        } else if (error.message.includes('Invalid object')) {
            return { success: false, error: 'Invalid payment coin' };
        } else {
            return { success: false, error: 'Payment processing failed' };
        }
    }
}
```

## 🚀 Deployment

### Production Deployment

1. **Environment Variables**: Set production environment variables
2. **Error Monitoring**: Implement error tracking (Sentry, etc.)
3. **Logging**: Add comprehensive logging
4. **Rate Limiting**: Implement API rate limiting
5. **Monitoring**: Set up contract and API monitoring

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

## 📚 Resources

### Documentation Links

- [Sui Documentation](https://docs.sui.io/)
- [@mysten/sui.js SDK](https://sdk.mystenlabs.com/typescript)
- [Move Language Guide](https://move-language.github.io/move/)

### Support

- **GitHub Issues**: [Report bugs and request features](https://github.com/your-repo/issues)
- **Documentation**: [Complete API documentation](https://your-docs-site.com)
- **Community**: [Join our Discord](https://discord.gg/your-server)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**Built with ❤️ for the Sui ecosystem**
