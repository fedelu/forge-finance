# 🔥 Forge Finance - Solana DeFi Protocol

A comprehensive DeFi protocol built on Solana, featuring crucible management, governance, analytics, and yield farming capabilities.

## 🚀 Live Demo

**🌐 [Try the Live Demo](https://forge-finance-xxx.vercel.app)**

## ✨ Features

### 🏦 **Crucible Management**
- Create and manage liquidity crucibles
- Deposit SOL and earn yield
- Real-time balance tracking
- Multiple deposit options (Simple, Ultra Simple, Real SOL)

### 🗳️ **Governance System**
- Create and vote on proposals
- Protocol parameter changes
- Community-driven decisions
- Real-time voting results

### 📊 **Analytics Dashboard**
- Portfolio overview with SPARK and HEAT tokens
- Transaction history and statistics
- Performance metrics
- Real-time updates

### 💰 **Token Economics**
- **SPARK**: Governance token for voting
- **HEAT**: Reward token for participation
- Dynamic token generation based on deposits
- Real-time balance updates

## 🛠️ **Technology Stack**

### **Frontend**
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **Framer Motion** - Animations

### **Blockchain**
- **Solana Devnet** - Test network
- **Anchor Framework** - Smart contracts
- **Solana Web3.js** - Blockchain interaction
- **Wallet Adapter** - Multi-wallet support

### **Smart Contracts**
- **Forge Core** - Main protocol logic
- **Crucibles** - Liquidity management
- **Sparks** - Governance tokens
- **Heat** - Reward tokens
- **Smelters** - Yield generation
- **Reactors** - Advanced features
- **Firewall** - Security layer
- **Engineers** - Maintenance

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- Solana CLI
- Anchor CLI
- Git

### **Installation**

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/forge-finance.git
cd forge-finance

# Install dependencies
cd app
npm install

# Start development server
npm run dev
```

### **Environment Setup**

Create `.env.local` in the `app` directory:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_EXPLORER_URL=https://explorer.solana.com
NEXT_PUBLIC_COMMITMENT=confirmed
```

## 🔧 **Development**

### **Build Smart Contracts**

```bash
# Build all programs
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### **Run Frontend**

```bash
cd app
npm run dev
```

### **Test**

```bash
# Run smart contract tests
anchor test

# Run frontend tests
cd app
npm test
```

## 📱 **Usage**

### **For Users**

1. **Connect Wallet**
   - Install Phantom or Solflare wallet
   - Connect to Solana Devnet
   - Get test SOL from [faucet](https://faucet.solana.com)

2. **Deposit Tokens**
   - Navigate to Crucibles tab
   - Select a crucible
   - Choose deposit option
   - Confirm transaction

3. **Earn Rewards**
   - Earn SPARK tokens for governance
   - Earn HEAT tokens for participation
   - Track performance in Analytics

4. **Governance**
   - Create proposals
   - Vote on community decisions
   - Influence protocol direction

### **For Developers**

1. **Smart Contract Development**
   - Modify programs in `programs/`
   - Update IDL files
   - Deploy changes

2. **Frontend Development**
   - Update components in `app/src/components/`
   - Modify pages in `app/src/pages/`
   - Add new features

3. **Integration**
   - Connect new wallets
   - Add new token types
   - Extend functionality

## 🏗️ **Architecture**

```
forge-finance/
├── programs/           # Solana smart contracts
│   ├── forge-core/     # Main protocol
│   ├── forge-crucibles/# Crucible management
│   ├── forge-sparks/   # Governance tokens
│   ├── forge-heat/     # Reward tokens
│   ├── forge-smelters/ # Yield generation
│   ├── forge-reactors/ # Advanced features
│   ├── forge-firewall/ # Security layer
│   └── forge-engineers/# Maintenance
├── app/               # Next.js frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── contexts/   # State management
│   │   ├── pages/      # Next.js pages
│   │   └── utils/      # Utility functions
│   └── public/         # Static assets
├── sdk/               # TypeScript SDK
└── scripts/           # Deployment scripts
```

## 🔒 **Security**

- **Smart Contract Audits**: Regular security reviews
- **Firewall Protection**: Multi-layer security
- **Access Controls**: Role-based permissions
- **Input Validation**: Comprehensive checks

## 🌐 **Deployment**

### **Vercel (Recommended)**

1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Root Directory: `app`
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Deploy automatically

### **Other Platforms**

- **Netlify**: Static site hosting
- **GitHub Pages**: Free hosting
- **Firebase**: Google Cloud hosting

## 📊 **Analytics**

- **Transaction Tracking**: Real-time monitoring
- **Performance Metrics**: Yield and volume data
- **User Analytics**: Engagement statistics
- **Protocol Health**: System status

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 **Links**

- **Live Demo**: [forge-finance-xxx.vercel.app](https://forge-finance-xxx.vercel.app)
- **Documentation**: [docs.forge-finance.com](https://docs.forge-finance.com)
- **Discord**: [discord.gg/forge-finance](https://discord.gg/forge-finance)
- **Twitter**: [@forge_finance](https://twitter.com/forge_finance)

## 🙏 **Acknowledgments**

- Solana Foundation for the blockchain infrastructure
- Anchor team for the development framework
- Vercel for hosting and deployment
- Open source community for inspiration

---

**Built with ❤️ for the Solana DeFi ecosystem**