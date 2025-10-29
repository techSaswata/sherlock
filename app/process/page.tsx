"use client"

import { Footer } from "@/components/footer"
import Aurora from "@/components/Aurora"
import { URLProcessor } from "@/components/url-processor"

export default function ProcessPage() {
  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <main className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 w-full h-full">
          <Aurora colorStops={["#475569", "#64748b", "#475569"]} amplitude={1.2} blend={0.6} speed={0.8} />
        </div>
        <div className="relative z-10">
          <URLProcessor />
          <Footer />
        </div>
      </main>
    </div>
  )
}

