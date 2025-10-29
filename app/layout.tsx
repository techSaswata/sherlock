import type React from "react"
import type { Metadata } from "next"
import { Suspense } from "react"
import "./globals.css"
import { PageTransition } from "@/components/page-transition"
import { NavigationTransition } from "@/components/navigation-transition"
import { SpeedInsights } from "@vercel/speed-insights/next"

import { Dancing_Script, Caveat, Roboto as V0_Font_Roboto, Playfair_Display as V0_Font_Playfair_Display } from 'next/font/google'

// Initialize fonts
const _roboto = V0_Font_Roboto({ subsets: ['latin'], weight: ["100","300","400","500","700","900"], variable: '--v0-font-roboto' })
const _playfairDisplay = V0_Font_Playfair_Display({ subsets: ['latin'], weight: ["400","500","600","700","800","900"], variable: '--v0-font-playfair-display' })
const _v0_fontVariables = `${_roboto.variable} ${_playfairDisplay.variable}`

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-dancing-script",
  display: "swap",
})

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Sherlock - AI Automation for Enterprise",
  description:
    "Transform your business with intelligent AI automation solutions. Empower your organization to operate at the speed of thought.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-serif antialiased ${dancingScript.variable} ${caveat.variable} ${_v0_fontVariables}`}>
        <Suspense fallback={null}>
          <NavigationTransition />
          <PageTransition>{children}</PageTransition>
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  )
}
