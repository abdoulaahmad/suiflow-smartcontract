# SuiFlow Smart Contract Deployment Guide

## 🚀 Deploy to Sui Testnet

### Prerequisites
```bash
# Install Sui CLI
curl -fLJO https://github.com/MystenLabs/sui/releases/download/testnet-v1.14.0/sui-testnet-v1.14.0-windows-x86_64.tgz
# Extract and add to PATH

# Create new wallet (save the mnemonic!)
sui client new-address ed25519

# Get testnet SUI tokens
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
--header 'Content-Type: application/json' \
--data-raw '{
    "FixedAmountRequest": {
        "recipient": "YOUR_ADDRESS_HERE"
    }
}'
```

### Deploy Contract
```bash
# Navigate to contract directory
cd C:\code\sui-flow\SUIFLOW\Documents\suiflow\smart-contract

# Create Move.toml if it doesn't exist
echo '[package]
name = "suiflow"
version = "0.0.1"
edition = "2024.beta"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "testnet" }

[addresses]
suiflow = "0x0"' > Move.toml

# Build and deploy
sui client publish --gas-budget 100000000

# Save the output:
# - Package ID: 0x1234... 
# - PaymentProcessor Object ID: 0x5678...
```

## 📋 Expected Output
```
Transaction Digest: AbCdEf123...
╭─────────────────────────────────────────────────────────────╮
│ Object Changes                                              │
├─────────────────────────────────────────────────────────────┤
│ Created Objects:                                            │
│  ┌──                                                        │
│  │ ObjectID: 0x5678...                                      │
│  │ Sender: 0x1234...                                        │
│  │ Owner: Shared                                            │
│  │ ObjectType: 0x1234...::payment_processor::PaymentProcessor │
│  └──                                                        │
│ Published Objects:                                          │
│  ┌──                                                        │
│  │ PackageID: 0x1234...                                     │
│  │ Modules: payment_processor                               │
│  └──                                                        │
╰─────────────────────────────────────────────────────────────╯
```

## 🔧 Configure SDK
After deployment, update your SDK:
```javascript
Suiflow.configure({
    contractPackageId: '0x1234...', // Package ID from deployment
    contractObjectId: '0x5678...', // PaymentProcessor Object ID
    useSmartContract: true,
    adminFee: 0.01 // 0.01 SUI
});
```
