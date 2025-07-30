import React, { useState, useEffect } from 'react';
import { ConnectButton, useWallet } from '@suiet/wallet-kit';
import SuiFlowPaymentProcessor from '../SuiFlowPaymentProcessor';

const PaymentWidget = ({ merchantAddress, productId, productName, price }) => {
    const [processor, setProcessor] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('');
    const [stats, setStats] = useState(null);
    const wallet = useWallet();

    useEffect(() => {
        // Initialize processor when component mounts
        const processorInstance = new SuiFlowPaymentProcessor();
        setProcessor(processorInstance);
        
        // Load contract stats
        loadStats(processorInstance);
    }, []);

    const loadStats = async (processorInstance) => {
        try {
            const contractStats = await processorInstance.getContractStats();
            setStats(contractStats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handlePayment = async () => {
        if (!wallet.connected || !processor) {
            setPaymentStatus('Please connect your wallet first');
            return;
        }

        setIsProcessing(true);
        setPaymentStatus('Processing payment...');

        try {
            // Get user's coins
            const coins = await processor.getCoins(wallet.address);
            
            if (coins.length === 0) {
                throw new Error('No SUI coins found in wallet');
            }

            // Find a coin with sufficient balance
            const sufficientCoin = coins.find(coin => 
                parseInt(coin.balance) >= price + 10000000 // price + admin fee
            );

            if (!sufficientCoin) {
                throw new Error('Insufficient balance for payment');
            }

            // Process the payment
            const result = await processor.processPayment(
                merchantAddress,
                `merchant_${Date.now()}`, // Generate unique merchant ID
                productId,
                sufficientCoin.objectId,
                wallet.account // This would need to be adapted based on wallet kit
            );

            setPaymentStatus(`✅ Payment successful! Transaction: ${result.digest}`);
            
            // Reload stats after successful payment
            await loadStats(processor);
            
        } catch (error) {
            console.error('Payment failed:', error);
            setPaymentStatus(`❌ Payment failed: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="payment-widget">
            <div className="product-info">
                <h3>{productName}</h3>
                <p>Price: {price / 1000000000} SUI</p>
                <p>Admin Fee: 0.01 SUI</p>
                <p>Total: {(price + 10000000) / 1000000000} SUI</p>
            </div>

            <div className="wallet-section">
                <ConnectButton />
                
                {wallet.connected && (
                    <div>
                        <p>Connected: {wallet.address?.slice(0, 8)}...</p>
                        <button 
                            onClick={handlePayment} 
                            disabled={isProcessing}
                            className="pay-button"
                        >
                            {isProcessing ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                )}
            </div>

            {paymentStatus && (
                <div className="payment-status">
                    <p>{paymentStatus}</p>
                </div>
            )}

            {stats && (
                <div className="contract-stats">
                    <h4>Contract Statistics</h4>
                    <p>Total Payments: {stats.totalPaymentsProcessed}</p>
                    <p>Total Fees Collected: {stats.totalFeesCollected / 1000000000} SUI</p>
                </div>
            )}

            <style jsx>{`
                .payment-widget {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 20px;
                    max-width: 400px;
                    margin: 20px auto;
                }
                
                .product-info {
                    margin-bottom: 20px;
                }
                
                .pay-button {
                    background: #007bff;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                }
                
                .pay-button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                }
                
                .payment-status {
                    margin-top: 15px;
                    padding: 10px;
                    border-radius: 5px;
                    background: #f8f9fa;
                }
                
                .contract-stats {
                    margin-top: 20px;
                    padding: 15px;
                    background: #e9ecef;
                    border-radius: 5px;
                }
            `}</style>
        </div>
    );
};

export default PaymentWidget;
