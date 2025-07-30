import React from 'react';
import PaymentWidget from './components/PaymentWidget';
import './App.css';

function App() {
  // Example products
  const products = [
    {
      id: 'widget_001',
      name: 'Premium Widget',
      price: 50000000, // 0.05 SUI in MIST
      merchantAddress: '0x1234567890123456789012345678901234567890123456789012345678901234'
    },
    {
      id: 'service_002', 
      name: 'Consultation Service',
      price: 100000000, // 0.1 SUI in MIST
      merchantAddress: '0x1234567890123456789012345678901234567890123456789012345678901234'
    }
  ];

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 SuiFlow Payment Demo</h1>
        <p>Decentralized payment processing on Sui blockchain</p>
      </header>
      
      <main className="App-main">
        <div className="products-grid">
          {products.map(product => (
            <PaymentWidget
              key={product.id}
              merchantAddress={product.merchantAddress}
              productId={product.id}
              productName={product.name}
              price={product.price}
            />
          ))}
        </div>
        
        <div className="info-section">
          <h2>How it works:</h2>
          <ol>
            <li>Connect your Sui wallet (Suiet, Sui Wallet, etc.)</li>
            <li>Click "Pay Now" on any product</li>
            <li>Confirm the transaction in your wallet</li>
            <li>Payment is processed instantly on-chain</li>
            <li>Merchant receives payment minus 0.01 SUI admin fee</li>
          </ol>
        </div>
      </main>
      
      <footer className="App-footer">
        <p>
          Contract: <code>0xce43cd5a...641a0</code> | 
          Network: Sui Testnet | 
          Admin Fee: 0.01 SUI
        </p>
      </footer>
    </div>
  );
}

export default App;
