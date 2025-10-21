import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { createFogoSessionClient } from '../lib/fogoSession'
import { FogoSessionsProvider } from '../components/FogoSessions'
// Removed simulation mode and demo config

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)
  const [fogoClient, setFogoClient] = useState<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Initialize Fogo Sessions client client-side only
    console.log('🔥 Initializing Fogo Sessions client...');
    
    const sessionClient = createFogoSessionClient();
    setFogoClient(sessionClient);
    console.log("✅ Fogo session client initialized", sessionClient);
    
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <FogoSessionsProvider fogoClient={fogoClient}>
      <Component {...pageProps} fogoClient={fogoClient} />
    </FogoSessionsProvider>
  )
}
