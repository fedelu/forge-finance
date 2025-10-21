import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { createFogoSessionClient } from '../lib/fogoSession'
import { createFogoSessionClientDemo } from '../lib/fogoSessionDemo'
import { FogoSessionsProvider } from '../components/FogoSessions'
import { SimulationProvider } from '../components/SimulationMode'
import { DEMO_CONFIG } from '../config/demo-config'

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)
  const [fogoClient, setFogoClient] = useState<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Initialize Fogo Sessions client client-side only
    console.log('🔥 Initializing Fogo Sessions client...');
    
    // Use demo client for investor demo pages
    const isInvestorDemo = typeof window !== 'undefined' && 
      (window.location.pathname.includes('demo-investor') || DEMO_CONFIG.DEMO_MODE);
    
    let sessionClient;
    if (isInvestorDemo) {
      console.log('🎮 Initializing DEMO Fogo Sessions client for investor presentation');
      sessionClient = createFogoSessionClientDemo();
    } else {
      console.log('🔗 Initializing REAL Fogo Sessions client');
      sessionClient = createFogoSessionClient();
    }
    
    setFogoClient(sessionClient);
    console.log("✅ Fogo session client initialized", sessionClient);
    
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <SimulationProvider>
      <FogoSessionsProvider fogoClient={fogoClient}>
        <Component {...pageProps} fogoClient={fogoClient} />
      </FogoSessionsProvider>
    </SimulationProvider>
  )
}
