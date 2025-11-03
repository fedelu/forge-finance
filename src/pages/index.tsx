import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

function Home() {
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(true)

  useEffect(() => {
    // Redirect to demo page
    const timer = setTimeout(() => {
      router.push('/demo')
    }, 100)
    
    return () => clearTimeout(timer)
  }, [router])

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-forge-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-forge-primary mx-auto mb-4"></div>
          <p className="text-forge-primary text-lg">Loading Forge Finance...</p>
        </div>
      </div>
    )
  }

  return null
}
export default dynamic(() => Promise.resolve(Home), { ssr: false })
