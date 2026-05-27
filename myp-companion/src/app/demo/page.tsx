"use client"

import dynamic from "next/dynamic"

const ShaderShowcase = dynamic(() => import("@/components/ui/hero"), { ssr: false })

export default function DemoPage() {
  return (
    <div className="min-h-screen h-full w-full">
      <ShaderShowcase />
    </div>
  )
}
