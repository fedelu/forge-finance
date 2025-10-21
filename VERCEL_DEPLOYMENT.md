# Vercel Deployment Guide for Fogo Sessions

## Current Status
- ✅ **Local Development**: Paymaster disabled, works without gasless transactions
- ⚠️ **Production**: Requires domain registration with Fogo team

## Steps to Deploy to Vercel

### 1. Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Deploy
vercel

# Or use the Vercel dashboard at https://vercel.com
```

### 2. Update Environment Variables in Vercel
After deployment, update these environment variables in your Vercel dashboard:

```env
# Production Fogo Sessions Configuration
NEXT_PUBLIC_SOLANA_NETWORK=fogo-testnet
NEXT_PUBLIC_RPC_URL=https://testnet.fogo.io
NEXT_PUBLIC_COMMITMENT=confirmed
NEXT_PUBLIC_PAYMASTER_URL=https://testnet.fogo.io/paymaster
NEXT_PUBLIC_APP_DOMAIN=https://your-app.vercel.app
NODE_ENV=production
```

### 3. Register Domain with Fogo Team
Contact the Fogo team to register your production domain:
- **Domain**: `https://your-app.vercel.app` (replace with your actual Vercel URL)
- **Purpose**: Enable gasless transactions via Fogo Sessions paymaster
- **Contact**: Reach out through Fogo's official channels

### 4. Test Production Deployment
Once the domain is registered:
1. Visit your Vercel deployment
2. Test the FOGO Sessions button
3. Verify wallet connection works
4. Confirm gasless transactions are enabled

## Current Behavior

### Local Development (localhost:3000)
- ❌ Paymaster disabled (domain not registered)
- ✅ Sessions work without gasless transactions
- ✅ Wallet connection works
- ✅ All features functional

### Production (Vercel)
- ⚠️ Paymaster enabled (once domain registered)
- ✅ Gasless transactions enabled
- ✅ Full Fogo Sessions functionality
- ✅ Production-ready

## Troubleshooting

### If you get paymaster errors on Vercel:
1. Check that `NEXT_PUBLIC_APP_DOMAIN` matches your Vercel URL exactly
2. Verify the domain is registered with Fogo team
3. Check Vercel environment variables are set correctly

### If localhost still has issues:
- The app should work without paymaster
- Check browser console for any remaining errors
- Ensure `isLocalhost` detection is working correctly
