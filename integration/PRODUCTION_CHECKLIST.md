# 🚀 SuiFlow Production Deployment Checklist

## Pre-Deployment

### ✅ Security Checklist
- [ ] All private keys are stored securely (environment variables, not in code)
- [ ] API endpoints have proper authentication where needed
- [ ] Input validation is implemented for all user inputs
- [ ] Rate limiting is configured for API endpoints
- [ ] Error messages don't expose sensitive information

### ✅ Testing Checklist  
- [ ] All unit tests pass (`sui move test`)
- [ ] Integration tests pass (`node test-integration.js`)
- [ ] End-to-end payment flow tested on testnet
- [ ] Frontend wallet integration tested with multiple wallets
- [ ] API endpoints tested with proper error handling

### ✅ Configuration Checklist
- [ ] Environment variables configured for production
- [ ] Contract addresses verified and documented
- [ ] Admin wallet secured with hardware wallet (recommended)
- [ ] Monitoring and alerting configured
- [ ] Backup procedures documented

## Deployment Steps

### 1. **Deploy to Sui Mainnet** (if not already done)
```bash
# Switch to mainnet
sui client switch --env mainnet

# Deploy contract
sui client publish --gas-budget 100000000

# Update .env files with new mainnet addresses
```

### 2. **Deploy Backend API**
```bash
# Production deployment (example with PM2)
npm install -g pm2
pm2 start api/server.js --name "suiflow-api"
pm2 save
pm2 startup
```

### 3. **Deploy Frontend**
```bash
# Build for production
npm run build

# Deploy to your hosting service (Vercel, Netlify, etc.)
# Update environment variables in hosting dashboard
```

### 4. **Set Up Monitoring**

#### Application Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure uptime monitoring for API
- [ ] Set up performance monitoring
- [ ] Create dashboards for key metrics

#### Blockchain Monitoring
- [ ] Monitor contract events for anomalies
- [ ] Set up alerts for failed transactions
- [ ] Track admin fee accumulation
- [ ] Monitor gas usage patterns

### 5. **Documentation**
- [ ] API documentation updated
- [ ] Integration guide for merchants
- [ ] Troubleshooting guide created
- [ ] Contact information for support

## Post-Deployment

### ✅ Go-Live Checklist
- [ ] Test a small payment on mainnet
- [ ] Verify all monitoring is working
- [ ] Confirm admin functions work correctly
- [ ] Test wallet connections on production site
- [ ] Verify analytics and tracking

### ✅ Ongoing Operations
- [ ] Regular admin fee withdrawals scheduled
- [ ] Security updates planned and tested
- [ ] Backup admin keys stored securely
- [ ] Performance metrics reviewed weekly
- [ ] User feedback collection process established

## Emergency Procedures

### Contract Issues
1. **If smart contract has issues:**
   - Contract is immutable - cannot be changed
   - Deploy new contract version if needed
   - Update frontend to use new contract
   - Communicate changes to users

2. **If API is down:**
   - Users can still interact directly with contract
   - Fix API and redeploy
   - Monitor for any missed events

3. **If admin wallet is compromised:**
   - Immediately deploy new contract with different admin
   - Update all systems to use new contract
   - Notify users of the change

## Support Contacts
- **Smart Contract:** Contract deployed at [package_id]
- **API Issues:** Check logs at /var/log/suiflow/
- **Frontend Issues:** Check browser console and hosting logs
- **Wallet Issues:** Refer users to wallet provider support

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=3001
NETWORK=mainnet
ADMIN_PRIVATE_KEY=your_secure_admin_key
PACKAGE_ID=your_mainnet_package_id
PROCESSOR_OBJECT_ID=your_mainnet_processor_id
CORS_ORIGIN=https://your-domain.com
```

### Frontend (.env.production)
```
REACT_APP_NETWORK=mainnet
REACT_APP_PACKAGE_ID=your_mainnet_package_id
REACT_APP_PROCESSOR_OBJECT_ID=your_mainnet_processor_id
REACT_APP_API_URL=https://api.your-domain.com
```
