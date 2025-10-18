import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to demo page
    router.push('/demo')
  }, [router])

  return (
    <div className="min-h-screen bg-forge-dark flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-forge-primary"></div>
    </div>
  )
}
