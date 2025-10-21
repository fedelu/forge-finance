import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { FogoSessionsProvider } from '../components/FogoSessions'

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <FogoSessionsProvider>
      <Component {...pageProps} />
    </FogoSessionsProvider>
  )
}
