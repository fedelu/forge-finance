import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
// Defer importing Fogo session client to the browser to avoid SSR module incompatibilities
import dynamic from 'next/dynamic'
const FogoSessionsProvider = dynamic(() => import('../components/FogoSessions').then(m => m.FogoSessionsProvider), { ssr: false })
// Removed simulation mode and demo config

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)
  const [fogoClient, setFogoClient] = useState<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Initialize Fogo Sessions client client-side only
    console.log('🔥 Initializing Fogo Sessions client...');
    
    (async () => {
      const { createFogoSessionClient } = await import('../lib/fogoSession')
      const sessionClient = createFogoSessionClient();
      setFogoClient(sessionClient);
      console.log("✅ Fogo session client initialized", sessionClient);
    })();
    
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
