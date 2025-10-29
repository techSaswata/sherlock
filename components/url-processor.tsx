"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link2, CheckCircle2, Loader2, Instagram, Youtube, Globe, Image as ImageIcon, Video, Sparkles, Zap, Brain, Search, Download, SplitSquareHorizontal, Scan, MessageSquare, Music, FileText } from "lucide-react"
import { ProcessingBackground } from "./processing-background"

type ContentType = "instagram-reel" | "instagram-post" | "youtube-video" | "blog-website" | null

interface ProcessStep {
  id: string
  label: string
  completed: boolean
  active: boolean
  progress?: number
  icon: any
}

interface URLProcessorProps {
  onProcessingChange?: (isProcessing: boolean) => void
}

export function URLProcessor({ onProcessingChange }: URLProcessorProps) {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [contentType, setContentType] = useState<ContentType>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<ProcessStep[]>([])
  const [scanProgress, setScanProgress] = useState(0)
  const [logs, setLogs] = useState<Array<{ id: string; message: string; timestamp: string; type: 'info' | 'success' | 'warning' }>>([])
  const completionRef = useRef<HTMLDivElement>(null)

  // Notify parent component when processing state changes
  useEffect(() => {
    onProcessingChange?.(isProcessing)
  }, [isProcessing, onProcessingChange])

  // Auto-scroll to completion section when all steps are done
  useEffect(() => {
    if (steps.length > 0 && steps.every((s) => s.completed)) {
      setTimeout(() => {
        completionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        })
      }, 500)
    }
  }, [steps])

  const addLog = (message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
    setLogs(prev => [...prev, { 
      id: `${Date.now()}-${Math.random()}`, 
      message, 
      timestamp, 
      type 
    }])
  }

  const identifyContentType = (url: string): ContentType => {
    if (url.includes("instagram.com/reel")) return "instagram-reel"
    if (url.includes("instagram.com/p")) return "instagram-post"
    if (url.includes("youtu.be") || url.includes("youtube.com")) return "youtube-video"
    return "blog-website"
  }

  const getContentTypeLabel = (type: ContentType): string => {
    switch (type) {
      case "instagram-reel":
        return "Instagram Reel"
      case "instagram-post":
        return "Instagram Post"
      case "youtube-video":
        return "YouTube Video"
      case "blog-website":
        return "Blog Website"
      default:
        return ""
    }
  }

  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case "instagram-reel":
      case "instagram-post":
        return <Instagram className="w-6 h-6" />
      case "youtube-video":
        return <Youtube className="w-6 h-6" />
      case "blog-website":
        return <Globe className="w-6 h-6" />
      default:
        return null
    }
  }

  const generateSteps = (type: ContentType): ProcessStep[] => {
    const baseSteps = [
      { id: "parsing", label: "Parsing URL", completed: false, active: false, icon: Search },
      { id: "identifying", label: `Identified as ${getContentTypeLabel(type)}`, completed: false, active: false, icon: Sparkles },
    ]

    if (type === "instagram-reel" || type === "youtube-video") {
      return [
        ...baseSteps,
        { id: "downloading", label: `Downloading ${type === "instagram-reel" ? "reel" : "video"}`, completed: false, active: false, icon: Download },
        { id: "splitting", label: "Splitting into frames", completed: false, active: false, icon: SplitSquareHorizontal },
        { id: "ocr", label: "Running OCR", completed: false, active: false, icon: Scan },
        { id: "scanning", label: "Scanning frames", completed: false, active: false, progress: 0, icon: Brain },
        { id: "captions", label: "Analyzing captions", completed: false, active: false, icon: MessageSquare },
        { id: "audio", label: "Splitting audio", completed: false, active: false, icon: Music },
        { id: "stt", label: "Parsing through STT", completed: false, active: false, icon: Zap },
        { id: "report", label: "Concising into a report", completed: false, active: false, icon: FileText },
      ]
    } else if (type === "instagram-post") {
      return [
        ...baseSteps,
        { id: "downloading", label: "Downloading pic", completed: false, active: false, icon: Download },
        { id: "ocr", label: "Running OCR", completed: false, active: false, icon: Scan },
        { id: "captions", label: "Analyzing captions", completed: false, active: false, icon: MessageSquare },
        { id: "report", label: "Concising into a report", completed: false, active: false, icon: FileText },
      ]
    } else {
      // blog-website
      return [
        ...baseSteps,
        { id: "crawling", label: "Crawling through the site", completed: false, active: false, icon: Search },
        { id: "analyzing", label: "Analyzing texts", completed: false, active: false, icon: Brain },
        { id: "images", label: "Checking for images", completed: false, active: false, icon: ImageIcon },
        { id: "report", label: "Concising into a report", completed: false, active: false, icon: FileText },
      ]
    }
  }

  const processURL = async () => {
    if (!url.trim()) return

    setIsProcessing(true)
    setCurrentStep(0)
    setScanProgress(0)
    setLogs([])

    addLog('🚀 Initializing content processor...', 'info')
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Identify content type
    const type = identifyContentType(url)
    setContentType(type)
    addLog(`✓ Detected content type: ${getContentTypeLabel(type)}`, 'success')

    // Generate steps based on content type
    const processSteps = generateSteps(type)
    setSteps(processSteps)
    addLog(`📋 Generated ${processSteps.length} processing steps`, 'info')

    // TODO: Make actual API call to backend
    // const response = await fetch('/api/process', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ url })
    // })

    // Simulate processing steps
    for (let i = 0; i < processSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, i === 0 ? 800 : 1500))

      addLog(`⚡ ${processSteps[i].label}...`, 'info')

      setSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          active: index === i,
          completed: index < i,
        }))
      )
      setCurrentStep(i)

      // Special handling for scanning frames step with progress bar
      if (processSteps[i].id === "scanning") {
        for (let progress = 0; progress <= 100; progress += 5) {
          await new Promise((resolve) => setTimeout(resolve, 50))
          setScanProgress(progress)
          setSteps((prev) =>
            prev.map((step) =>
              step.id === "scanning" ? { ...step, progress } : step
            )
          )
          if (progress % 20 === 0 && progress > 0) {
            addLog(`📊 Scanning progress: ${progress}%`, 'info')
          }
        }
      }
      
      addLog(`✓ ${processSteps[i].label} completed`, 'success')
    }

    // Mark all as completed
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSteps((prev) => prev.map((step) => ({ ...step, completed: true, active: false })))
    addLog('🎉 Processing completed successfully!', 'success')
    addLog('📄 Report generated and ready for review', 'success')
    
    // TODO: Handle the response from backend
    // const result = await response.json()
    
    // Keep processing view open until user clicks "Process Another"
    // setIsProcessing will be set to false only in resetForm()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    processURL()
  }

  const resetForm = () => {
    setUrl("")
    setIsProcessing(false)
    setContentType(null)
    setCurrentStep(0)
    setSteps([])
    setScanProgress(0)
    setLogs([])
  }

  // Get visible steps (previous, current, next)
  const getVisibleSteps = () => {
    const visible = []
    if (currentStep > 0 && steps[currentStep - 1]) {
      visible.push({ step: steps[currentStep - 1], index: currentStep - 1, position: 'prev' })
    }
    if (steps[currentStep]) {
      visible.push({ step: steps[currentStep], index: currentStep, position: 'current' })
    }
    if (currentStep < steps.length - 1 && steps[currentStep + 1]) {
      visible.push({ step: steps[currentStep + 1], index: currentStep + 1, position: 'next' })
    }
    return visible
  }

  return (
    <section className="min-h-screen relative pt-16 md:pt-20 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - Hidden during processing */}
        {!isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block mb-2">Analyze Content.</span>
              <span className="block bg-gradient-to-r from-primary via-green-400 to-primary bg-clip-text text-transparent">
                Uncover Truth.
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto font-light leading-relaxed">
              Simply paste a link from YouTube, Instagram, or any website. Our AI will extract insights, analyze authenticity, and deliver evidence-backed intelligence in seconds.
            </p>
          </motion.div>
        )}

        {/* URL Input Section */}
        <AnimatePresence mode="wait">
          {!isProcessing ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              <form onSubmit={handleSubmit}>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <Link2 className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-white">Enter URL</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://instagram.com/reel/... or https://youtube.com/..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      required
                    />
                    
                    <button
                      type="submit"
                      disabled={!url.trim()}
                      className="w-full bg-primary hover:bg-primary/90 text-black font-semibold py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      Process URL
                    </button>
                  </div>

                  {/* Example URLs */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-sm text-white/50 mb-3">Try with example URLs:</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "Instagram Reel", url: "https://instagram.com/reel/example" },
                        { label: "YouTube", url: "https://youtu.be/example" },
                        { label: "Blog", url: "https://example.com/blog" },
                      ].map((example) => (
                        <button
                          key={example.label}
                          type="button"
                          onClick={() => setUrl(example.url)}
                          className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 hover:text-white transition-all"
                        >
                          {example.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="mb-12"
            >
              {/* Processing Container with 3D Background */}
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl overflow-hidden min-h-[600px]">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                  <ProcessingBackground />
                </div>

                {/* Content Type Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative z-10 flex items-center justify-center gap-3 mb-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 w-fit mx-auto"
                >
                  <div className="p-2 bg-primary/20 rounded-full">
                    {getContentTypeIcon(contentType)}
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Processing</p>
                    <p className="text-lg font-semibold text-white">{getContentTypeLabel(contentType)}</p>
                  </div>
                </motion.div>

                {/* Horizontal Carousel View */}
                <div className="relative z-10 flex items-center justify-center min-h-[400px] overflow-hidden px-4">
                  <div className="relative w-full h-full flex items-center justify-center">
                    <AnimatePresence mode="sync">
                      {getVisibleSteps().map(({ step, index, position }) => {
                        const Icon = step.icon
                        const isPrev = position === 'prev'
                        const isCurrent = position === 'current'
                        const isNext = position === 'next'

                        return (
                          <motion.div
                            key={step.id}
                            initial={{ 
                              x: isNext ? '150%' : isPrev ? '-150%' : '0%',
                              opacity: 0,
                              scale: isCurrent ? 1 : 0.65,
                            }}
                            animate={{
                              x: isPrev ? '-120%' : isCurrent ? '0%' : '120%',
                              opacity: isCurrent ? 1 : 0.35,
                              scale: isCurrent ? 1 : 0.65,
                              y: isCurrent ? 0 : 50,
                            }}
                            exit={{
                              x: isPrev ? '-150%' : '150%',
                              opacity: 0,
                              scale: 0.5,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 28,
                              opacity: { duration: 0.3 }
                            }}
                            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                              isCurrent ? 'z-30' : 'z-10'
                            }`}
                            style={{
                              pointerEvents: isCurrent ? 'auto' : 'none',
                            }}
                          >
                            {/* Step Card */}
                            <div
                              className={`relative backdrop-blur-xl rounded-3xl border transition-all duration-500 ${
                                step.completed
                                  ? 'bg-primary/10 border-primary/40'
                                  : step.active
                                  ? 'bg-white/10 border-primary/60 shadow-2xl shadow-primary/20'
                                  : 'bg-white/5 border-white/10'
                              } ${isCurrent ? 'w-[340px] md:w-[400px] p-8' : 'w-[240px] md:w-[280px] p-6'}`}
                            >
                              {/* Animated Border Glow */}
                              {step.active && isCurrent && (
                                <motion.div
                                  className="absolute inset-0 rounded-3xl"
                                  animate={{
                                    boxShadow: [
                                      '0 0 20px rgba(132, 204, 22, 0.3)',
                                      '0 0 40px rgba(132, 204, 22, 0.6)',
                                      '0 0 20px rgba(132, 204, 22, 0.3)',
                                    ]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                />
                              )}

                              {/* Icon with Animation */}
                              <div className="flex justify-center mb-4">
                                <div
                                  className={`relative rounded-2xl transition-all duration-500 ${
                                    isCurrent ? 'p-6' : 'p-4'
                                  } ${
                                    step.completed
                                      ? 'bg-primary/20'
                                      : step.active
                                      ? 'bg-primary/30'
                                      : 'bg-white/5'
                                  }`}
                                >
                                  {step.completed ? (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: "spring", stiffness: 200 }}
                                    >
                                      <CheckCircle2 className={`${isCurrent ? 'w-10 h-10' : 'w-7 h-7'} text-primary`} />
                                    </motion.div>
                                  ) : step.active ? (
                                    <motion.div
                                      animate={{
                                        rotate: 360,
                                        scale: [1, 1.1, 1]
                                      }}
                                      transition={{
                                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                        scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                                      }}
                                    >
                                      <Icon className={`${isCurrent ? 'w-10 h-10' : 'w-7 h-7'} text-primary`} />
                                    </motion.div>
                                  ) : (
                                    <Icon className={`${isCurrent ? 'w-10 h-10' : 'w-7 h-7'} text-white/40`} />
                                  )}

                                  {/* Animated Rings */}
                                  {step.active && isCurrent && (
                                    <>
                                      <motion.div
                                        className="absolute inset-0 rounded-2xl border-2 border-primary/40"
                                        animate={{
                                          scale: [1, 1.3, 1.3],
                                          opacity: [0.6, 0, 0]
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          ease: "easeOut"
                                        }}
                                      />
                                      <motion.div
                                        className="absolute inset-0 rounded-2xl border-2 border-primary/40"
                                        animate={{
                                          scale: [1, 1.5, 1.5],
                                          opacity: [0.4, 0, 0]
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                          ease: "easeOut",
                                          delay: 0.5
                                        }}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Step Label */}
                              <h3
                                className={`text-center font-semibold mb-2 transition-all ${
                                  isCurrent ? 'text-lg md:text-xl' : 'text-xs md:text-sm'
                                } ${
                                  step.active || step.completed ? 'text-white' : 'text-white/40'
                                }`}
                              >
                                {step.label}
                              </h3>

                              {/* Step Number */}
                              <p className={`text-center text-white/40 ${isCurrent ? 'text-xs' : 'text-[10px]'}`}>
                                Step {index + 1} of {steps.length}
                              </p>

                              {/* Progress Bar for Scanning Step */}
                              {step.id === "scanning" && step.active && isCurrent && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-6"
                                >
                                  <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
                                      initial={{ width: "0%" }}
                                      animate={{ width: `${scanProgress}%` }}
                                      transition={{ duration: 0.3 }}
                                    />
                                    {/* Shimmer effect */}
                                    <motion.div
                                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                      animate={{ x: ["-100%", "200%"] }}
                                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                  </div>
                                  <p className="text-sm text-center text-primary font-semibold mt-2">
                                    {scanProgress}% complete
                                  </p>
                                </motion.div>
                              )}

                              {/* Floating Particles for Active Step */}
                              {step.active && isCurrent && (
                                <>
                                  {[...Array(4)].map((_, i) => (
                                    <motion.div
                                      key={i}
                                      className="absolute w-1.5 h-1.5 bg-primary/60 rounded-full hidden md:block"
                                      style={{
                                        left: `${25 + i * 15}%`,
                                        top: `${35 + (i % 2) * 25}%`,
                                      }}
                                      animate={{
                                        y: [-15, 15, -15],
                                        x: [0, 8, 0],
                                        opacity: [0.4, 0.8, 0.4],
                                        scale: [1, 1.3, 1]
                                      }}
                                      transition={{
                                        duration: 2.5 + i * 0.3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.4
                                      }}
                                    />
                                  ))}
                                </>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Real-time Logs Section */}
                {logs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative z-10 mt-12 mb-8 max-w-4xl mx-auto"
                  >
                    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                          Processing Logs
                        </h3>
                        <div className="ml-auto text-xs text-white/40">
                          {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
                        </div>
                      </div>

                      {/* Logs Container - Show only latest log */}
                      <div className="min-h-[60px] flex items-center">
                        <AnimatePresence mode="wait">
                          {logs.length > 0 && (() => {
                            const log = logs[logs.length - 1]
                            return (
                              <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className={`flex items-start gap-3 p-3 rounded-lg transition-all w-full ${
                                  log.type === 'success'
                                    ? 'bg-primary/5 border-l-2 border-primary/50'
                                    : log.type === 'warning'
                                    ? 'bg-yellow-500/5 border-l-2 border-yellow-500/50'
                                    : 'bg-white/5 border-l-2 border-white/20'
                                }`}
                              >
                                {/* Timestamp */}
                                <span className="text-[10px] text-white/40 font-mono mt-0.5 shrink-0">
                                  {log.timestamp}
                                </span>

                                {/* Message */}
                                <p className="text-sm text-white/80 flex-1 leading-relaxed">
                                  {log.message}
                                </p>

                                {/* Status Indicator */}
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                                  log.type === 'success'
                                    ? 'bg-primary'
                                    : log.type === 'warning'
                                    ? 'bg-yellow-500'
                                    : 'bg-blue-400'
                                }`} />
                              </motion.div>
                            )
                          })()}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Progress Indicator Dots */}
                <div className="relative z-10 flex justify-center gap-2 mt-8 mb-6">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      className={`rounded-full transition-all duration-300 ${
                        step.completed
                          ? 'w-2 h-2 bg-primary'
                          : step.active
                          ? 'w-10 h-2 bg-primary shadow-lg shadow-primary/50'
                          : 'w-2 h-2 bg-white/20'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    />
                  ))}
                </div>

                {/* Completion Message */}
                {steps.length > 0 && steps.every((s) => s.completed) && (
                  <motion.div
                    ref={completionRef}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="relative z-10 mt-12 p-6 bg-primary/10 border border-primary/30 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 0.6 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white">Processing Complete!</h3>
                    </div>
                    <p className="text-white/70 mb-4">
                      Your content has been successfully analyzed and a comprehensive report has been generated.
                    </p>
                    <div className="flex gap-3">
                      <button className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]">
                        View Report
                      </button>
                      <button
                        onClick={resetForm}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        Process Another
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid - Hidden during processing */}
        {!isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <Video className="w-6 h-6" />,
                title: "Video Analysis",
                description: "Process Instagram Reels and YouTube videos with frame-by-frame analysis",
              },
              {
                icon: <ImageIcon className="w-6 h-6" />,
                title: "Image Processing",
                description: "Extract text and insights from Instagram posts and images",
              },
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Web Crawling",
                description: "Analyze blog posts and websites with intelligent content extraction",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="p-3 bg-primary/20 rounded-full w-fit mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
