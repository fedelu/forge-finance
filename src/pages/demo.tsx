import React from 'react'
import dynamic from 'next/dynamic'

const DemoClient = dynamic(() => import('../components/DemoClient'), { ssr: false })

export default function Demo() {
  return <DemoClient />
}

