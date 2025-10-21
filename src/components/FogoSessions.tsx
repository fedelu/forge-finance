import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createFogoSessionSmart, OfficialFogoSessionResponse, OfficialFogoSessionConfig } from '../utils/officialFogoSessions';

// Phantom wallet types
interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  isConnected?: boolean;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  on: (event: string, callback: (args: any) => void) => void;
  removeListener: (event: string, callback: (args: any) => void) => void;
}


// FOGO Sessions Context
interface FogoSessionContextType {
  isEstablished: boolean;
  walletPublicKey: PublicKey | null;
  sessionData: OfficialFogoSessionResponse | null;
  fogoBalance: number;
  connect: () => Promise<void>;
  endSession: () => Promise<void>;
  sendTransaction: (instructions: any[]) => Promise<string>;
  depositToCrucible: (amount: number) => Promise<{ success: boolean; transactionId: string }>;
  withdrawFromCrucible: (amount: number) => Promise<{ success: boolean; transactionId: string }>;
  calculateAPY: (principal: number, timeInDays: number) => number;
  calculateCompoundInterest: (principal: number, apy: number, timeInDays: number) => number;
  refreshBalance: () => Promise<void>;
  error: string | null;
}

const FogoSessionContext = createContext<FogoSessionContextType | null>(null);

// FOGO Sessions Provider
export function FogoSessionsProvider({ children }: { children: React.ReactNode }) {
  const [walletPublicKey, setWalletPublicKey] = useState<PublicKey | null>(null);
  const [sessionData, setSessionData] = useState<OfficialFogoSessionResponse | null>(null);
  const [fogoBalance, setFogoBalance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [phantomProvider, setPhantomProvider] = useState<any>(null);

  // Check for Phantom wallet on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.solana?.isPhantom) {
      setPhantomProvider(window.solana as any);
    }
  }, []);


  const connect = async (publicKey?: PublicKey) => {
    try {
      console.log('🔥 Starting FOGO Sessions SIMULATION with Phantom...');
      setError(null);
      
      let walletPublicKey = publicKey;
      
      // If no public key provided, connect to Phantom
      if (!walletPublicKey) {
        if (!phantomProvider) {
          throw new Error('Phantom wallet not found. Please install Phantom wallet.');
        }
        
        const response = await phantomProvider.connect();
        walletPublicKey = response.publicKey;
        console.log('✅ Connected to Phantom wallet:', walletPublicKey.toString());
      }
      
      // SIMULATION MODE: No real FOGO Sessions API calls
      // All FOGO functionality is simulated based on wallet balance
      console.log('🎭 SIMULATION MODE: Real FOGO tokens are blocked');
      console.log('💰 All FOGO operations will use simulated balances only');
      
      // Create simulated FOGO session
      const sessionData: OfficialFogoSessionResponse = {
        success: true,
        sessionId: 'sim_fogo_' + Math.random().toString(36).substr(2, 9),
        sessionKey: 'sim_session_' + Math.random().toString(36).substr(2, 16),
        userPublicKey: walletPublicKey.toString(),
        expiresAt: (Date.now() + (24 * 60 * 60 * 1000)).toString(), // 24 hours
        message: 'FOGO Session established in SIMULATION MODE - No real FOGO tokens'
      };
      
      setWalletPublicKey(walletPublicKey);
      setSessionData(sessionData);
      
      // Load simulated FOGO balance for the connected wallet
      const storedBalance = localStorage.getItem(`fogo_balance_${walletPublicKey.toString()}`);
      if (storedBalance) {
        setFogoBalance(parseFloat(storedBalance));
        console.log('💰 Loaded simulated FOGO balance:', parseFloat(storedBalance), 'FOGO');
      } else {
        setFogoBalance(1000); // New wallet gets 1000 simulated FOGO tokens
        localStorage.setItem(`fogo_balance_${walletPublicKey.toString()}`, '1000');
        console.log('💰 New wallet - 1000 simulated FOGO tokens allocated');
      }
      
      // Trigger wallet connection event to sync with main wallet context
      window.dispatchEvent(new CustomEvent('walletConnected', { 
        detail: { publicKey: walletPublicKey.toString() } 
      }));
      
      console.log('🔥 FOGO Session SIMULATION established successfully!');
      console.log('Session ID:', sessionData.sessionId);
      console.log('Session Key:', sessionData.sessionKey);
      console.log('Phantom Public Key:', walletPublicKey.toString());
      console.log('Simulated FOGO Balance:', fogoBalance, 'FOGO');
      console.log('⚠️  WARNING: This is a simulation - no real FOGO tokens are involved');
      
    } catch (error: any) {
      console.error('❌ Failed to establish FOGO Sessions simulation:', error);
      setError(error.message);
      throw error;
    }
  };

  const endSession = async () => {
    try {
      console.log('🔄 Ending FOGO Session and disconnecting from Phantom...');
      
      // Disconnect from Phantom wallet if connected
      if (phantomProvider && phantomProvider.isConnected) {
        try {
          await phantomProvider.disconnect();
          console.log('✅ Disconnected from Phantom wallet');
        } catch (error) {
          console.warn('⚠️ Error disconnecting from Phantom:', error);
        }
      }
      
      setSessionData(null);
      setWalletPublicKey(null);
      setError(null);
      
      // Trigger wallet disconnection event
      window.dispatchEvent(new CustomEvent('walletDisconnected'));
      
      console.log('✅ FOGO Sessions ended');
    } catch (error: any) {
      console.error('❌ Error ending FOGO Session:', error);
      throw error;
    }
  };

  const sendTransaction = async (instructions: any[]): Promise<string> => {
    try {
      console.log('🔥 Sending SIMULATED transaction via FOGO Sessions...');
      
      if (!sessionData) {
        throw new Error('No active FOGO Session');
      }
      
      if (!walletPublicKey) {
        throw new Error('No wallet connected');
      }
      
      // SIMULATION MODE: All transactions are simulated
      console.log('🎭 SIMULATION MODE: No real blockchain transactions');
      console.log('📦 Simulated Instructions:', instructions);
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a mock signature
      const signature = 'sim_fogo_' + Math.random().toString(36).substr(2, 9);
      
      console.log('✅ FOGO Sessions SIMULATED transaction sent:', signature);
      console.log('⚠️  WARNING: This is a simulation - no real blockchain transaction occurred');
      return signature;
      
    } catch (error: any) {
      console.error('❌ Failed to send simulated transaction via FOGO Sessions:', error);
      throw error;
    }
  };

  // Single deposit function for SIMULATED FOGO tokens
  const depositToCrucible = async (amount: number) => {
    if (amount > fogoBalance) {
      throw new Error('Insufficient simulated FOGO balance');
    }
    
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }
    
    console.log(`🏛️ SIMULATING deposit of ${amount} FOGO tokens`);
    console.log('🎭 SIMULATION MODE: No real FOGO tokens are deposited');
    
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update simulated balance
    const newBalance = fogoBalance - amount;
    setFogoBalance(newBalance);
    
    // Store in localStorage for persistence
    if (walletPublicKey) {
      localStorage.setItem(`fogo_balance_${walletPublicKey.toString()}`, newBalance.toString());
    }
    
    console.log(`✅ Successfully SIMULATED deposit of ${amount} FOGO tokens`);
    console.log('⚠️  WARNING: This is a simulation - no real FOGO tokens were deposited');
    return { success: true, transactionId: `sim_deposit_${Date.now()}` };
  };

  // Single withdraw function for SIMULATED FOGO tokens
  const withdrawFromCrucible = async (amount: number) => {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }
    
    console.log(`🏛️ SIMULATING withdrawal of ${amount} FOGO tokens`);
    console.log('🎭 SIMULATION MODE: No real FOGO tokens are withdrawn');
    
    // Simulate transaction processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update simulated balance
    const newBalance = fogoBalance + amount;
    setFogoBalance(newBalance);
    
    // Store in localStorage for persistence
    if (walletPublicKey) {
      localStorage.setItem(`fogo_balance_${walletPublicKey.toString()}`, newBalance.toString());
    }
    
    console.log(`✅ Successfully SIMULATED withdrawal of ${amount} FOGO tokens`);
    console.log('⚠️  WARNING: This is a simulation - no real FOGO tokens were withdrawn');
    return { success: true, transactionId: `sim_withdraw_${Date.now()}` };
  };

  const refreshBalance = async () => {
    if (walletPublicKey) {
      const storedBalance = localStorage.getItem(`fogo_balance_${walletPublicKey.toString()}`);
      if (storedBalance) {
        setFogoBalance(parseFloat(storedBalance));
        console.log('💰 Refreshed simulated FOGO balance:', parseFloat(storedBalance), 'FOGO');
      } else {
        setFogoBalance(1000); // Default simulated balance for new wallets
        localStorage.setItem(`fogo_balance_${walletPublicKey.toString()}`, '1000');
        console.log('💰 New wallet - 1000 simulated FOGO tokens allocated');
      }
      console.log('🎭 SIMULATION MODE: Balance refreshed from local storage only');
    }
  };

  // Calculate SIMULATED APY based on crucible type and time
  const calculateAPY = (principal: number, timeInDays: number): number => {
    console.log('🎭 SIMULATION MODE: Calculating simulated APY');
    
    // Base APY rates for different crucible types (simulation)
    const baseAPY = 0.12; // 12% base APY
    
    // Time-based multiplier (longer staking = higher APY)
    let timeMultiplier = 1;
    if (timeInDays >= 365) timeMultiplier = 1.5; // 50% bonus for 1+ year
    else if (timeInDays >= 180) timeMultiplier = 1.3; // 30% bonus for 6+ months
    else if (timeInDays >= 90) timeMultiplier = 1.2; // 20% bonus for 3+ months
    else if (timeInDays >= 30) timeMultiplier = 1.1; // 10% bonus for 1+ month
    
    // Principal-based multiplier (larger deposits = slightly higher APY)
    let principalMultiplier = 1;
    if (principal >= 10000) principalMultiplier = 1.1; // 10% bonus for 10k+ FOGO
    else if (principal >= 5000) principalMultiplier = 1.05; // 5% bonus for 5k+ FOGO
    else if (principal >= 1000) principalMultiplier = 1.02; // 2% bonus for 1k+ FOGO
    
    const finalAPY = baseAPY * timeMultiplier * principalMultiplier;
    
    console.log(`📊 SIMULATED APY Calculation: ${principal} FOGO for ${timeInDays} days`);
    console.log(`   Base APY: ${(baseAPY * 100).toFixed(2)}%`);
    console.log(`   Time Multiplier: ${timeMultiplier}x`);
    console.log(`   Principal Multiplier: ${principalMultiplier}x`);
    console.log(`   Final SIMULATED APY: ${(finalAPY * 100).toFixed(2)}%`);
    console.log('⚠️  WARNING: This is a simulation - no real APY is earned');
    
    return finalAPY;
  };

  // Calculate SIMULATED compound interest with APY
  const calculateCompoundInterest = (principal: number, apy: number, timeInDays: number): number => {
    console.log('🎭 SIMULATION MODE: Calculating simulated compound interest');
    
    // Convert APY to daily rate
    const dailyRate = apy / 365;
    
    // Calculate compound interest
    const finalAmount = principal * Math.pow(1 + dailyRate, timeInDays);
    const interest = finalAmount - principal;
    
    console.log(`💰 SIMULATED Interest Calculation: ${principal} FOGO at ${(apy * 100).toFixed(2)}% APY for ${timeInDays} days`);
    console.log(`   Daily Rate: ${(dailyRate * 100).toFixed(4)}%`);
    console.log(`   Final Amount: ${finalAmount.toFixed(6)} FOGO`);
    console.log(`   SIMULATED Interest Earned: ${interest.toFixed(6)} FOGO`);
    console.log('⚠️  WARNING: This is a simulation - no real interest is earned');
    
    return interest;
  };

  const value: FogoSessionContextType = {
    isEstablished: !!sessionData,
    walletPublicKey,
    sessionData,
    fogoBalance,
    connect,
    endSession,
    sendTransaction,
    depositToCrucible,
    withdrawFromCrucible,
    calculateAPY,
    calculateCompoundInterest,
    refreshBalance,
    error,
  };

  return (
    <FogoSessionContext.Provider value={value}>
      {children}
    </FogoSessionContext.Provider>
  );
}

// FOGO Sessions Hook
export function useSession() {
  const context = useContext(FogoSessionContext);
  if (!context) {
    throw new Error('useSession must be used within FogoSessionsProvider');
  }
  return context;
}

// FOGO Sessions Button with Pyron Flow
export function FogoSessionsButton() {
  const { isEstablished, connect, endSession, walletPublicKey, sessionData, fogoBalance, refreshBalance, error } = useSession();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokens' | 'session'>('tokens');
  const [currentScreen, setCurrentScreen] = useState<'main' | 'receive' | 'send'>('main');
  const [isOpen, setIsOpen] = useState(false);
  const [flowStep, setFlowStep] = useState<'login' | 'wallet' | 'session-limits' | 'phantom' | 'complete'>('login');
  const [sessionDuration, setSessionDuration] = useState('One Week');
  const [limitTokenAccess, setLimitTokenAccess] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');

  const handleConnect = async () => {
    console.log('🔥 FOGO Sessions button clicked!');
    setIsOpen(true);
    setFlowStep('wallet');
  };

  const handleWalletSelect = (wallet: 'phantom') => {
    console.log(`Selected wallet: ${wallet}`);
    setFlowStep('session-limits');
  };

  const handleSessionLimitsConfirm = () => {
    console.log('Session limits confirmed');
    setFlowStep('phantom');
  };

  const handlePhantomConnect = async () => {
    console.log('Connecting to Phantom...');
    setIsConnecting(true);
    try {
      // Connect to Phantom wallet and create FOGO session
      await connect();
      
      setFlowStep('complete');
    } catch (error: any) {
      console.error('❌ Phantom connection failed:', error);
      if (error.code === 4001) {
        alert('Connection rejected by user. Please try again.');
      } else {
        alert('Failed to connect to Phantom wallet. Please make sure Phantom is installed and unlocked.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendTokens = async () => {
    if (!recipientAddress || !sendAmount) {
      alert('Please fill in both recipient address and amount');
      return;
    }
    
    const amount = parseFloat(sendAmount);
    if (amount > fogoBalance) {
      alert('Insufficient FOGO balance');
      return;
    }
    
    try {
      // Simulate sending FOGO tokens (no real transaction)
      console.log(`💸 Simulating send of ${amount} FOGO to ${recipientAddress}`);
      
      // Simulate transaction processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update balance using context function
      const newBalance = fogoBalance - amount;
      if (walletPublicKey) {
        localStorage.setItem(`fogo_balance_${walletPublicKey.toString()}`, newBalance.toString());
        // Trigger a refresh to update the context
        window.location.reload();
      }
      
      setRecipientAddress('');
      setSendAmount('');
      setCurrentScreen('main');
      
      alert(`✅ Successfully sent ${amount} FOGO to ${recipientAddress} (simulation)`);
    } catch (error) {
      console.error('❌ Failed to send tokens:', error);
      alert('Failed to send tokens. Please try again.');
    }
  };

  const handleReceiveTokens = () => {
    setCurrentScreen('main');
    alert('Share your wallet address to receive FOGO tokens');
  };



  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await endSession();
      setFlowStep('login');
      setIsOpen(false);
    } catch (error) {
      console.error('Disconnection failed:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };


  // Render different flow steps
  const renderFlowStep = () => {
    switch (flowStep) {
      case 'wallet':
        return (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-96 max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Connect a wallet on Solana to continue</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => handleWalletSelect('phantom')}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Phantom</span>
                </div>
                <span className="text-sm text-green-600 font-medium">Detected</span>
              </button>
            </div>
          </div>
        );

      case 'session-limits':
        return (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-96 max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Session Limits</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">Limit how many tokens this app is allowed to interact with</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allow transactions with this app for
                </label>
                <select 
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="One Week">One Week</option>
                  <option value="One Month">One Month</option>
                  <option value="One Year">One Year</option>
                  <option value="Forever">Forever</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="limit-tokens"
                  checked={limitTokenAccess}
                  onChange={(e) => setLimitTokenAccess(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="limit-tokens" className="ml-2 text-sm text-gray-700">
                  Limit this app's access to tokens
                </label>
              </div>
            </div>

            <button
              onClick={handleSessionLimitsConfirm}
              className="w-full mt-6 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Log in
            </button>
          </div>
        );

      case 'phantom':
        return (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-96 max-w-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect to Phantom</h3>
              <p className="text-gray-600 mb-6">Please approve the connection in your Phantom wallet</p>
              
              {isConnecting ? (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Connecting to Phantom...</span>
                  <span className="text-sm text-gray-500">Check your Phantom wallet for approval</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handlePhantomConnect}
                    className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 transition-colors"
                  >
                    Connect Phantom
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case 'complete':
  if (isEstablished && sessionData) {
          const walletAddress = walletPublicKey?.toString() || '6odzDTmqQ95xkuukWAaeoMVwacjK7Ywi5GRZU8jYUrYi';
          const shortAddress = `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`;

          const copyToClipboard = () => {
            navigator.clipboard.writeText(walletAddress);
          };

          const openFaucet = () => {
            window.open(`https://www.gas.zip/faucet/fogo?address=${walletAddress}`, '_blank');
          };

          // Always show the same fixed button in header, with modal overlay when open
    return (
            <div className="relative">
              {/* Fixed header button - always same size */}
              <button
                onClick={() => setIsOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 group"
              >
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">FOGO Wallet</div>
                  <div className="text-xs text-orange-100">{shortAddress}</div>
                </div>
                <svg className="w-4 h-4 text-white group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Modal overlay when open */}
              {isOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 w-96 max-w-sm overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                  title="Close wallet"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">FOGO Wallet</h3>
                      <p className="text-orange-100 text-sm">Connected</p>
                    </div>
                  </div>
                  <button 
                    onClick={copyToClipboard} 
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    title="Copy address"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-xs text-orange-100 mb-1">Wallet Address</p>
                  <p className="font-mono text-sm text-white break-all">{shortAddress}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-4 px-6 pt-4">
                <button 
                  onClick={() => { setActiveTab('tokens'); setCurrentScreen('main'); }}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'tokens' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Tokens
                </button>
                <button 
                  onClick={() => setActiveTab('session')}
                  className={`px-4 py-2 text-sm font-medium ${activeTab === 'session' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Session
                </button>
              </div>

              {/* Main Content */}
              <div className="px-6 mb-6">
                {activeTab === 'tokens' ? (
                  <div>
                    {currentScreen === 'main' ? (
                      <>
                        {/* Action Buttons */}
                        <div className="flex justify-center space-x-8 mb-6">
                          <button 
                            onClick={() => setCurrentScreen('receive')}
                            className="flex flex-col items-center hover:opacity-80"
                          >
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <span className="text-xs text-gray-600">Receive tokens</span>
                          </button>
                          <button 
                            onClick={() => setCurrentScreen('send')}
                            className="flex flex-col items-center hover:opacity-80"
                          >
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </div>
                            <span className="text-xs text-gray-600">Send tokens</span>
                          </button>
                          <button 
                            onClick={openFaucet}
                            className="flex flex-col items-center hover:opacity-80"
                          >
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <span className="text-xs text-gray-600">Get tokens</span>
                          </button>
                        </div>

                        {/* Token List */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
                                </svg>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">FOGO</span>
                                <div className="text-xs text-gray-500">FOGO Testnet</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">{fogoBalance.toFixed(6)} FOGO</div>
                              <button
                                onClick={refreshBalance}
                                className="text-xs text-orange-600 hover:text-orange-700 transition-colors"
                              >
                                Refresh
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : currentScreen === 'receive' ? (
                      <div className="text-center">
                        <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                          <div className="w-24 h-24 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Receive FOGO</h3>
                        <p className="text-gray-600 mb-4">Share this address to receive FOGO tokens</p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-gray-600 mb-1">Your wallet address</p>
                          <p className="font-mono text-sm text-gray-900 break-all">{walletAddress}</p>
                        </div>
                        <button
                          onClick={copyToClipboard}
                          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors mb-3"
                        >
                          Copy Address
                        </button>
                        <button
                          onClick={() => setCurrentScreen('main')}
                          className="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
                        >
                          Back
                        </button>
                      </div>
                    ) : currentScreen === 'send' ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Send FOGO</h3>
                          <button
                            onClick={() => setCurrentScreen('main')}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Recipient Address
                            </label>
                            <input
                              type="text"
                              value={recipientAddress}
                              onChange={(e) => setRecipientAddress(e.target.value)}
                              placeholder="Enter Solana address"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
        </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Amount
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="number"
                                value={sendAmount}
                                onChange={(e) => setSendAmount(e.target.value)}
                                placeholder="0.00"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                              <button
                                onClick={() => setSendAmount(fogoBalance.toString())}
                                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                Max
                              </button>
        </div>
                            <p className="text-xs text-gray-500 mt-1">Balance: {fogoBalance.toFixed(6)} FOGO</p>
        </div>
                          <button
                            onClick={handleSendTokens}
                            className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                          >
                            Send FOGO
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <div className="bg-gray-100 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-600">Session expires in 6 days</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allow transactions with this app for
                        </label>
                        <select 
                          value={sessionDuration}
                          onChange={(e) => setSessionDuration(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="One Week">One Week</option>
                          <option value="One Month">One Month</option>
                          <option value="One Year">One Year</option>
                          <option value="Forever">Forever</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          id="limit-tokens-session"
                          checked={limitTokenAccess}
                          onChange={(e) => setLimitTokenAccess(e.target.checked)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="limit-tokens-session" className="ml-2 text-sm text-gray-700">
                          Limit this app's access to tokens
                        </label>
                      </div>
                      <button className="w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors">
                        Update limits
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 px-6 pb-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" />
                  </svg>
                  <span className="font-medium text-gray-900">FOGO</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Minimize
                  </button>
        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
                    className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
                    {isDisconnecting ? 'Logging out...' : 'Log Out'}
        </button>
                </div>
              </div>
                </div>
              )}
            </div>
          );
        }
        break;

      default:
        return null;
    }
  };

  // Show flow step modal when open
  if (isOpen && flowStep !== 'complete') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
        <div onClick={(e) => e.stopPropagation()}>
          {renderFlowStep()}
        </div>
      </div>
    );
  }

  // Show completed wallet interface
  if (isEstablished && sessionData && flowStep === 'complete') {
    return (
      <div className="relative">
        {renderFlowStep()}
      </div>
    );
  }

  // Initial login button
  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleConnect}
        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
      >
        <span className="text-sm">Log in with</span>
        <svg 
          width="80" 
          height="24" 
          viewBox="0 0 80 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path 
            d="M14.724 0h-8.36L5.166 4.804h-3.61L.038 10.898a1.28 1.28 0 0 0 1.238 1.591h3.056L1.465 24l9.744-10.309c.771-.816.195-2.162-.925-2.162h-4.66l1.435-5.765h7.863l1.038-4.172A1.28 1.28 0 0 0 14.723 0ZM26.09 18.052h-2.896V5.58h9.086v2.525h-6.19v2.401h5.636v2.525H26.09v5.02Zm13.543.185c-1.283 0-2.404-.264-3.365-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.96-.523 2.08-.785 3.365-.785 1.285 0 2.42.259 3.381.777a5.474 5.474 0 0 1 2.233 2.218c.528.96.793 2.1.793 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.961.523-2.081.785-3.366.785v-.001Zm.016-2.525c1.118 0 1.98-.353 2.586-1.062.606-.708.91-1.652.91-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.602-1.055-1.128 0-1.984.351-2.595 1.054-.61.704-.916 1.645-.916 2.825 0 1.18.306 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Zm13.703 2.525c-1.211 0-2.28-.27-3.203-.808a5.647 5.647 0 0 1-2.163-2.256c-.517-.964-.776-2.079-.776-3.34 0-1.263.267-2.423.8-3.388a5.635 5.635 0 0 1 2.256-2.249c.97-.533 2.096-.801 3.38-.801 1.057 0 1.992.182 2.803.547a5.017 5.017 0 0 1 1.986 1.563c.513.677.837 1.489.971 2.432H56.39c-.103-.626-.394-1.113-.878-1.463-.482-.348-1.103-.523-1.863-.523-.718 0-1.344.16-1.878.476-.533.32-.945.77-1.231 1.356-.288.584-.43 1.277-.43 2.078 0 .801.148 1.515.445 2.11a3.27 3.27 0 0 0 1.262 1.379c.544.322 1.186.485 1.925.485.544 0 1.03-.084 1.454-.253.426-.17.762-.4 1.009-.693a1.5 1.5 0 0 0 .37-.993v-.37H53.51V11.31h3.865c.677 0 1.185.161 1.525.485.337.323.507.808.507 1.455v4.804h-2.648V16.73h-.077c-.299.503-.724.88-1.278 1.132-.554.252-1.237.377-2.048.377l-.003-.001Zm13.911 0c-1.283 0-2.405-.264-3.366-.793a5.603 5.603 0 0 1-2.24-2.233c-.533-.96-.8-2.09-.8-3.394 0-1.304.267-2.451.8-3.41a5.55 5.55 0 0 1 2.24-2.225c.961-.523 2.081-.785 3.366-.785 1.284 0 2.42.259 3.38.777a5.474 5.474 0 0 1 2.234 2.218c.528.96.792 2.1.792 3.425 0 1.324-.268 2.437-.801 3.403a5.56 5.56 0 0 1-2.24 2.233c-.96.523-2.08.785-3.365.785v-.001Zm.015-2.525c1.118 0 1.981-.353 2.587-1.062.605-.708.909-1.652.909-2.833 0-1.182-.304-2.137-.91-2.84-.605-.704-1.473-1.055-2.601-1.055-1.129 0-1.985.351-2.595 1.054-.611.704-.916 1.645-.916 2.825 0 1.18.305 2.14.916 2.85.61.708 1.48 1.061 2.61 1.061Z" 
            fill="currentColor"
          />
        </svg>
      </button>
      
      {error && (
        <div className="text-red-400 text-sm text-center max-w-xs">
          {error}
        </div>
      )}
    </div>
  );
}