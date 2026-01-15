"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link2, CheckCircle2, Loader2, Instagram, Youtube, Globe, Image as ImageIcon, Video, Sparkles, Zap, Brain, Search, Download, SplitSquareHorizontal, Scan, MessageSquare, Music, FileText, AlertCircle, TrendingUp, Target, BarChart3, ExternalLink, XCircle, BookOpen } from "lucide-react"
import { ProcessingBackground } from "./processing-background"
import { supabase } from "@/lib/supabase"

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

interface Source {
  name: string
  url: string
  date?: string
}

interface ClaimData {
  claim: string
  verified: boolean
  confidence: number
  status: string
  evidence?: string
  sources?: Source[]
}

interface ReportData {
  summary?: string
  authenticity_score?: number
  key_findings?: string[]
  claims?: ClaimData[]
  sentiment?: string
  recommendations?: string[]
  allSources?: Source[]
  [key: string]: any
}

export function URLProcessor({ onProcessingChange }: URLProcessorProps) {
  const [url, setUrl] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [contentType, setContentType] = useState<ContentType>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<ProcessStep[]>([])
  const [scanProgress, setScanProgress] = useState(0)
  const [logs, setLogs] = useState<Array<{ id: string; message: string; timestamp: string; type: 'info' | 'success' | 'warning' }>>([])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  
  // Ref to signal when results are ready (for speeding up animation)
  const resultsReadyRef = useRef<boolean>(false)
  const pendingResultsRef = useRef<any>(null)
  const [backendResponse, setBackendResponse] = useState<any>(null)
  const completionRef = useRef<HTMLDivElement>(null)

  // Backend API configuration - fallback to localhost if env not set
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/analyze'

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

  // Auto-scroll when report data is ready
  useEffect(() => {
    if (reportData) {
      setTimeout(() => {
        completionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        })
      }, 300)
    }
  }, [reportData])

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

  // Simulate progress bar for scanning step (frontend-only)
  const simulateProgress = async () => {
    for (let progress = 0; progress <= 100; progress += 5) {
      await new Promise((resolve) => setTimeout(resolve, 50))
      setScanProgress(progress)
      if (progress % 20 === 0 && progress > 0) {
        addLog(`📊 Scanning progress: ${progress}%`, 'info')
      }
    }
  }

  // Parse markdown report to extract structured data
  const parseMarkdownReport = (markdown: string): ReportData => {
    const report: ReportData = {
      key_findings: [],
      claims: [],
      recommendations: [],
      allSources: []
    }

    // Helper function to parse sources from text
    const parseSources = (text: string): Source[] => {
      const sources: Source[] = []
      // Match patterns like "- Name - URL (Date)" or "- [Name](URL)"
      const sourceRegex = /[-•]\s*(?:\[([^\]]+)\]\(([^)]+)\)|([^-\n]+?)\s*[-–]\s*(https?:\/\/[^\s\)]+)(?:\s*\(([^)]+)\))?)/gi
      let match
      while ((match = sourceRegex.exec(text)) !== null) {
        if (match[1] && match[2]) {
          // Markdown link format [Name](URL)
          sources.push({ name: match[1].trim(), url: match[2].trim() })
        } else if (match[3] && match[4]) {
          // Plain format: Name - URL (Date)
          sources.push({ 
            name: match[3].trim(), 
            url: match[4].trim(),
            date: match[5]?.trim()
          })
        }
      }
      return sources
    }

    // Extract EXPLANATION section as summary
    const explanationMatch = markdown.match(/## 1\. EXPLANATION\n([\s\S]*?)(?=\n## |$)/i)
    if (explanationMatch) {
      report.summary = explanationMatch[1].trim()
    }

    // Extract CONFIDENCE SCORE (more flexible matching)
    const confidenceMatch = markdown.match(/## 4\. CONFIDENCE SCORE[\s\n]*(\d+)\s*%/i) ||
                            markdown.match(/CONFIDENCE SCORE[:\s]*(\d+)\s*%/i) ||
                            markdown.match(/Confidence[:\s]*(\d+)\s*%/i)
    if (confidenceMatch) {
      report.authenticity_score = parseInt(confidenceMatch[1]) / 100
    }
    
    // Store overall confidence for use in claims
    const overallConfidence = report.authenticity_score || 0.85

    // Extract FINAL VERDICT for sentiment
    const verdictMatch = markdown.match(/## 3\. FINAL VERDICT\n([\s\S]*?)(?=\n## |$)/i)
    if (verdictMatch) {
      const verdictText = verdictMatch[1].toLowerCase()
      if (verdictText.includes('false') || verdictText.includes('misleading')) {
        report.sentiment = 'negative'
      } else if (verdictText.includes('true') || verdictText.includes('verified')) {
        report.sentiment = 'positive'
      } else {
        report.sentiment = 'neutral'
      }
    }

    // Extract claims from EVIDENCE section with sources
    const claimRegex = /### Claim \d+: (.*?)\n\*\*Status:\*\* (TRUE|FALSE|MISLEADING|UNVERIFIED)([\s\S]*?)(?=\n### Claim |\n## |$)/gi
    let claimMatch
    while ((claimMatch = claimRegex.exec(markdown)) !== null) {
      const claim = claimMatch[1].trim()
      const status = claimMatch[2].toUpperCase()
      const evidenceText = claimMatch[3] || ''
      
      // Try to extract per-claim confidence from the evidence text
      const claimConfidenceMatch = evidenceText.match(/confidence[:\s]*(\d+)\s*%/i)
      let confidence: number
      
      if (claimConfidenceMatch) {
        // Use per-claim confidence if found
        confidence = parseInt(claimConfidenceMatch[1]) / 100
      } else {
        // Use overall confidence score as base, slightly adjusted by status
        // This ensures the confidence reflects the actual research quality
        if (status === 'TRUE') {
          confidence = overallConfidence
        } else if (status === 'FALSE') {
          confidence = overallConfidence * 0.95 // Slightly lower for false claims
        } else if (status === 'MISLEADING') {
          confidence = overallConfidence * 0.85
        } else {
          confidence = 0.50 // Unverified claims get 50%
        }
      }

      // Extract key evidence
      const keyEvidenceMatch = evidenceText.match(/\*\*Key Evidence:\*\* ([\s\S]*?)(?=\n\*\*Sources|\n\n|$)/i)
      const evidence = keyEvidenceMatch ? keyEvidenceMatch[1].trim() : ''

      // Extract sources for this claim
      const sourcesMatch = evidenceText.match(/\*\*Sources:\*\*([\s\S]*?)(?=\n### |\n## |$)/i)
      const claimSources = sourcesMatch ? parseSources(sourcesMatch[1]) : []

      report.claims?.push({
        claim: claim,
        verified: status === 'TRUE',
        status: status,
        confidence: confidence,
        evidence: evidence,
        sources: claimSources
      })

      // Add to key findings
      if (evidence) {
        report.key_findings?.push(evidence)
      }

      // Add to all sources (deduplicated)
      claimSources.forEach(source => {
        if (!report.allSources?.some(s => s.url === source.url)) {
          report.allSources?.push(source)
        }
      })
    }

    // If no claims found via regex, try to extract from evidence section more broadly
    if (report.claims?.length === 0) {
      const evidenceMatch = markdown.match(/## 2\. EVIDENCE\n([\s\S]*?)(?=\n## |$)/i)
      if (evidenceMatch) {
        const evidenceText = evidenceMatch[1]
        const bulletMatch = evidenceText.match(/\*\*Key Evidence:\*\* ([\s\S]*?)(?=\n\*\*|$)/)
        if (bulletMatch) {
          const findings = bulletMatch[1]
            .split(/[.;]/)
            .map(f => f.trim())
            .filter(f => f.length > 20)
          report.key_findings?.push(...findings)
        }
        // Also try to get sources
        const sources = parseSources(evidenceText)
        report.allSources?.push(...sources)
      }
    }

    // Generate recommendations based on verdict
    if (report.sentiment === 'negative') {
      report.recommendations = [
        'Content appears to be AI-generated or manipulated',
        'Verify information with trusted sources before sharing',
        'Look for official statements or authoritative sources',
        'Be cautious of similar content from this source'
      ]
    } else if (report.sentiment === 'neutral') {
      report.recommendations = [
        'Cross-reference with multiple reliable sources',
        'Check for official verification or fact-check websites',
        'Consider the source\'s credibility and track record'
      ]
    } else {
      report.recommendations = [
        'Content appears authentic based on available evidence',
        'Still verify critical claims through official sources',
        'Monitor for updates or corrections to the information'
      ]
    }

    return report
  }

  // Submit URL to backend via POST request (fire and forget)
  const submitToBackend = async (url: string, contentType: ContentType) => {
    try {
      addLog('📡 Sending request to backend...', 'info')
      
      // Fire and forget - don't wait for response
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url
        })
      }).catch(error => {
        // console.error('Backend request error:', error)
      })

      addLog('✓ Request sent to backend', 'success')
    } catch (error) {
      console.error('Backend request error:', error)
      addLog('⚠️ Error sending request', 'warning')
    }
  }

  // Poll Supabase database for results (runs in parallel with animation)
  const startPollingForResults = (url: string) => {
    const maxAttempts = 300 // 10 minutes = 300 attempts (every 2 seconds)
    let attempts = 0

    const pollInterval = setInterval(async () => {
      attempts++

      try {
        // Query Supabase for the URL
        const { data, error } = await supabase
          .from('video_analysis')
          .select('*')
          .eq('url', url)
          .order('inserted_at', { ascending: false })
          .limit(1)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            // No rows found, continue polling silently
            return
          }
          console.error('Supabase error:', error)
          return
        }

        // Check if we have completed content
        if (data && data.url_status === 'completed' && data.url_content) {
          clearInterval(pollInterval)
          addLog('✅ Results ready! Finishing up...', 'success')
          
          // Parse the result and store it
          const content = data.url_content
          if (content.result) {
            const parsedReport = parseMarkdownReport(content.result)
            pendingResultsRef.current = {
              success: true,
              message: content.message || 'Analysis completed',
              result: content.result,
              report: parsedReport,
              status: data.url_status
            }
          } else {
            pendingResultsRef.current = content
          }
          
          // Signal that results are ready - animation will speed up
          resultsReadyRef.current = true
        } else if (data && data.url_status === 'error') {
          clearInterval(pollInterval)
          addLog('❌ Analysis failed - check backend logs', 'warning')
          resultsReadyRef.current = true
          pendingResultsRef.current = null
        }

        // Check if max attempts reached
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval)
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 2000) // Poll every 2 seconds

    return pollInterval
  }

  // Legacy polling function for fallback (waits until results)
  const pollDatabaseForResults = async (url: string): Promise<any> => {
    // If results are already available from parallel polling, return immediately
    if (resultsReadyRef.current && pendingResultsRef.current) {
      return pendingResultsRef.current
    }

    const maxAttempts = 300 // 10 minutes = 300 attempts (every 2 seconds)
    let attempts = 0

    addLog('🔍 Compiling the final report...', 'info')

    return new Promise((resolve) => {
      const pollInterval = setInterval(async () => {
        // Check if results came from parallel polling
        if (resultsReadyRef.current) {
          clearInterval(pollInterval)
          resolve(pendingResultsRef.current)
          return
        }

        attempts++

        try {
          // Query Supabase for the URL
          const { data, error } = await supabase
            .from('video_analysis')
            .select('*')
            .eq('url', url)
            .order('inserted_at', { ascending: false })
            .limit(1)
            .single()

          if (error) {
            if (error.code === 'PGRST116') {
              // No rows found, continue polling
              if (attempts % 15 === 0) { // Log every 30 seconds
                addLog(`⏳ Still waiting for results... (${Math.floor(attempts * 2 / 60)} min ${(attempts * 2) % 60} sec)`, 'info')
              }
              return
            }
            console.error('Supabase error:', error)
            return
          }

          // Check if we have completed content
          if (data && data.url_status === 'completed' && data.url_content) {
            clearInterval(pollInterval)
            addLog('✅ Results found in database!', 'success')
            
            // Parse the result
            const content = data.url_content
            if (content.result) {
              const parsedReport = parseMarkdownReport(content.result)
              resolve({
                success: true,
                message: content.message || 'Analysis completed',
                result: content.result,
                report: parsedReport,
                status: data.url_status
              })
            } else {
              resolve(content)
            }
          } else if (data && data.url_status === 'processing') {
            // Still processing, log periodically
            if (attempts % 15 === 0) {
              addLog(`⏳ Analysis in progress... (${Math.floor(attempts * 2 / 60)} min ${(attempts * 2) % 60} sec)`, 'info')
            }
          } else if (data && data.url_status === 'error') {
            // Error occurred
            clearInterval(pollInterval)
            addLog('❌ Analysis failed - check backend logs', 'warning')
            resolve(null)
          }

          // Check if max attempts reached
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            addLog('⏰ Polling timeout reached', 'warning')
            resolve(null)
          }
        } catch (err) {
          console.error('Polling error:', err)
        }
      }, 2000) // Poll every 2 seconds
    })
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

  // Step durations in milliseconds (total ~5 minutes = 300 seconds)
  const getStepDuration = (stepId: string, totalSteps: number): number => {
    // Heavy processing steps get more time
    const heavySteps: Record<string, number> = {
      "downloading": 25000,      // 25s - Download content
      "splitting": 40000,        // 40s - Split video into frames (heavy)
      "ocr": 50000,             // 50s - OCR processing (very heavy)
      "scanning": 60000,        // 60s - Scan all frames with progress bar (heaviest)
      "audio": 30000,           // 30s - Audio extraction
      "stt": 45000,             // 45s - Speech-to-text (heavy)
      "crawling": 35000,        // 35s - Web crawling
      "analyzing": 40000,       // 40s - Text analysis
      "report": 20000,          // 20s - Generate report
    }

    // Light processing steps
    const lightSteps: Record<string, number> = {
      "parsing": 5000,          // 5s
      "identifying": 3000,      // 3s
      "captions": 12000,        // 12s
      "images": 15000,          // 15s
    }

    return heavySteps[stepId] || lightSteps[stepId] || 8000
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
    setReportData(null)
    setBackendResponse(null)
    
    // Reset refs
    resultsReadyRef.current = false
    pendingResultsRef.current = null

    addLog('🚀 Initializing content processor...', 'info')

    // Identify content type in frontend
    const type = identifyContentType(url)
    setContentType(type)
    addLog(`✓ Detected content type: ${getContentTypeLabel(type)}`, 'success')

    // Generate steps based on content type
    const processSteps = generateSteps(type)
    setSteps(processSteps)
    addLog(`📋 Generated ${processSteps.length} processing steps`, 'info')

    // Submit to backend (fire and forget)
    await submitToBackend(url, type)

    // Start polling in parallel with animation
    startPollingForResults(url)

    // Run simulation mode while backend processes - pass steps directly
    // Animation will speed up when resultsReadyRef becomes true
    await runSimulationMode(processSteps)

    // Get results (either from parallel polling or wait for them)
    try {
      const backendData = await pollDatabaseForResults(url)
      
      if (backendData && backendData.report) {
        setBackendResponse(backendData)
        setReportData(backendData.report)
        addLog('🎉 Analysis completed successfully!', 'success')
        addLog('📄 Report generated and ready for review', 'success')
        if (backendData.message) {
          addLog(`✓ ${backendData.message}`, 'success')
        }
      } else if (backendData) {
        // Fallback for other response formats
        setBackendResponse(backendData)
        setReportData(backendData.report || backendData)
        addLog('🎉 Analysis completed successfully!', 'success')
        addLog('📄 Report generated and ready for review', 'success')
      } else {
        // No data received after polling timeout
        addLog('⏳ Compiling the final report...', 'info')
      }
    } catch (error) {
      console.error('Error receiving backend data:', error)
      addLog('❌ Error processing backend response', 'warning')
    }
  }

  // Simulation mode with realistic timing - speeds up when results are ready
  const runSimulationMode = async (processSteps: ProcessStep[]) => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Calculate speed multiplier: normal = 1, fast = much faster when results ready
    const getSpeedMultiplier = () => resultsReadyRef.current ? 0.1 : 1 // 10x faster when ready
    
    // Remaining steps should complete in ~10 seconds when results are ready
    const FAST_MODE_STEP_DURATION = 800 // 800ms per step in fast mode

    // Simulate processing steps with realistic durations
    for (let i = 0; i < processSteps.length; i++) {
      const remainingSteps = processSteps.length - i
      
      // If results are ready, speed through remaining steps in ~10 seconds
      let stepDuration: number
      if (resultsReadyRef.current) {
        stepDuration = Math.min(FAST_MODE_STEP_DURATION, 10000 / remainingSteps)
        if (i === currentStep) {
          addLog('⚡ Results ready! Finishing animation...', 'success')
        }
      } else {
        stepDuration = getStepDuration(processSteps[i].id, processSteps.length)
      }
      
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
        // If results ready, speed through progress bar quickly
        const fastMode = resultsReadyRef.current
        const progressStep = fastMode ? 20 : 5 // Bigger jumps in fast mode
        const progressInterval = fastMode ? 50 : stepDuration / 20
        
        for (let progress = 0; progress <= 100; progress += progressStep) {
          await new Promise((resolve) => setTimeout(resolve, progressInterval))
          setScanProgress(progress)
          setSteps((prev) =>
            prev.map((step) =>
              step.id === "scanning" ? { ...step, progress } : step
            )
          )
          // Check for results during progress
          if (resultsReadyRef.current && progress < 80) {
            // Jump to end if results ready
            setScanProgress(100)
            setSteps((prev) =>
              prev.map((step) =>
                step.id === "scanning" ? { ...step, progress: 100 } : step
              )
            )
            break
          }
        }
      } else {
        // Wait for the step duration, but check for results periodically
        const checkInterval = 200 // Check every 200ms
        const iterations = Math.ceil(stepDuration / checkInterval)
        
        for (let j = 0; j < iterations; j++) {
          await new Promise((resolve) => setTimeout(resolve, checkInterval))
          
          // If results became ready, speed up by breaking early
          if (resultsReadyRef.current && j > 2) {
            break
          }
        }
      }
      
      addLog(`✓ ${processSteps[i].label} completed`, 'success')
    }

    // Mark all processing steps as completed
    setSteps((prev) => prev.map((step) => ({ ...step, completed: true, active: false })))
    
    if (resultsReadyRef.current) {
      addLog('📝 Report ready!', 'success')
    } else {
      addLog('📝 Compiling into report...', 'info')
      addLog('🔍 Backend is finalizing the analysis. This may take up to 10 minutes.', 'info')
      addLog('⚠️ Please keep this page open while we process your request.', 'warning')
    }
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
    setReportData(null)
    setBackendResponse(null)
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
                  {/* <div className="mt-6 pt-6 border-t border-white/10">
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
                  </div> */}
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

                {/* Waiting for Backend */}
                {steps.length > 0 && steps.every((s) => s.completed) && !reportData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative z-10 mt-12 p-6 bg-primary/10 border border-primary/30 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-6 h-6 text-primary" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-white">Compiling Report...</h3>
                    </div>
                    <p className="text-white/80 mb-3">
                      Our AI is finalizing the comprehensive fact-check report. This process can take up to 10 minutes depending on the complexity of the content.
                    </p>
                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                      <p className="text-white/90 text-sm">
                        <strong>Please keep this page open.</strong> Closing or refreshing will cancel the analysis.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Completion Message and Report */}
                {steps.length > 0 && steps.every((s) => s.completed) && reportData && (
                  <motion.div
                    ref={completionRef}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="relative z-10 mt-12 space-y-6"
                  >
                    {/* Success Banner */}
                    <div className="p-6 bg-primary/10 border border-primary/30 rounded-2xl backdrop-blur-sm">
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
                    </div>

                    {/* Report Analysis Display */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-6"
                    >
                        {/* Report Header */}
                        <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-primary/20 rounded-xl">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-white">Analysis Report</h2>
                              <p className="text-white/60 text-sm">AI-powered content intelligence</p>
                            </div>
                          </div>

                          {/* Authenticity Score */}
                          {reportData.authenticity_score !== undefined && (
                            <div className="mb-6 p-4 bg-black/20 rounded-xl">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Target className="w-5 h-5 text-primary" />
                                  <span className="text-white font-semibold">Authenticity Score</span>
                                </div>
                                <span className="text-2xl font-bold text-primary">
                                  {Math.round(reportData.authenticity_score * 100)}%
                                </span>
                              </div>
                              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-green-400 rounded-full"
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${reportData.authenticity_score * 100}%` }}
                                  transition={{ duration: 1, delay: 0.8 }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Summary */}
                          {reportData.summary && (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-primary" />
                                Summary
                              </h3>
                              <p className="text-white/80 leading-relaxed">{reportData.summary}</p>
                            </div>
                          )}

                          {/* Sentiment */}
                          {reportData.sentiment && (
                            <div className="mb-6 p-4 bg-black/20 rounded-xl">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <span className="text-white/70 font-medium">Sentiment:</span>
                                <span className="text-white font-semibold capitalize">{reportData.sentiment}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Key Findings */}
                        {reportData.key_findings && reportData.key_findings.length > 0 && (
                          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-primary" />
                              Key Findings
                            </h3>
                            <div className="space-y-3">
                              {reportData.key_findings.map((finding, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.8 + index * 0.1 }}
                                  className="flex items-start gap-3 p-3 bg-black/20 rounded-xl"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                  <p className="text-white/80">{finding}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Claims Verification with Sources */}
                        {reportData.claims && reportData.claims.length > 0 && (
                          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <BarChart3 className="w-5 h-5 text-primary" />
                              Claims Verification
                            </h3>
                            <div className="space-y-4">
                              {reportData.claims.map((claim, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 1 + index * 0.1 }}
                                  className={`p-5 rounded-xl border ${
                                    claim.status === 'TRUE' 
                                      ? 'bg-green-500/5 border-green-500/20' 
                                      : claim.status === 'FALSE'
                                      ? 'bg-red-500/5 border-red-500/20'
                                      : claim.status === 'MISLEADING'
                                      ? 'bg-yellow-500/5 border-yellow-500/20'
                                      : 'bg-white/5 border-white/10'
                                  }`}
                                >
                                  {/* Claim Header */}
                                  <div className="flex items-start justify-between gap-4 mb-3">
                                    <p className="text-white font-medium flex-1">{claim.claim}</p>
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                      claim.status === 'TRUE' 
                                        ? 'bg-green-500/20 text-green-400' 
                                        : claim.status === 'FALSE'
                                        ? 'bg-red-500/20 text-red-400'
                                        : claim.status === 'MISLEADING'
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-white/10 text-white/60'
                                    }`}>
                                      {claim.status === 'TRUE' ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                      ) : claim.status === 'FALSE' ? (
                                        <XCircle className="w-4 h-4" />
                                      ) : (
                                        <AlertCircle className="w-4 h-4" />
                                      )}
                                      <span className="text-sm font-semibold">{claim.status}</span>
                                    </div>
                                  </div>

                                  {/* Evidence */}
                                  {claim.evidence && (
                                    <div className="mb-4 p-3 bg-black/20 rounded-lg">
                                      <p className="text-sm text-white/70 leading-relaxed">{claim.evidence}</p>
                                    </div>
                                  )}

                                  {/* Confidence Bar */}
                                  <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                                    <span>Confidence:</span>
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-[150px]">
                                      <motion.div
                                        className={`h-full rounded-full ${
                                          claim.status === 'TRUE' 
                                            ? 'bg-green-500' 
                                            : claim.status === 'FALSE'
                                            ? 'bg-red-500'
                                            : 'bg-yellow-500'
                                        }`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${claim.confidence * 100}%` }}
                                        transition={{ duration: 1, delay: 1.2 + index * 0.1 }}
                                      />
                                    </div>
                                    <span className="font-medium">{Math.round(claim.confidence * 100)}%</span>
                                  </div>

                                  {/* Sources for this claim */}
                                  {claim.sources && claim.sources.length > 0 && (
                                    <div className="border-t border-white/10 pt-3">
                                      <p className="text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <BookOpen className="w-3 h-3" />
                                        Sources ({claim.sources.length})
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {claim.sources.map((source, sIdx) => (
                                          <a
                                            key={sIdx}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-lg text-sm text-white/70 hover:text-primary transition-all group"
                                          >
                                            <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                            <span className="truncate max-w-[150px]">{source.name}</span>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* All Sources Summary */}
                        {reportData.allSources && reportData.allSources.length > 0 && (
                          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <BookOpen className="w-5 h-5 text-primary" />
                              Sources Referenced ({reportData.allSources.length})
                            </h3>
                            <div className="grid gap-3">
                              {reportData.allSources.map((source, index) => (
                                <motion.a
                                  key={index}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 1.3 + index * 0.05 }}
                                  className="flex items-center gap-3 p-3 bg-black/20 hover:bg-black/30 rounded-xl border border-transparent hover:border-primary/30 transition-all group"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                    <ExternalLink className="w-5 h-5 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate group-hover:text-primary transition-colors">
                                      {source.name}
                                    </p>
                                    <p className="text-xs text-white/40 truncate">
                                      {source.url.replace(/^https?:\/\//, '').split('/')[0]}
                                    </p>
                                  </div>
                                  {source.date && (
                                    <span className="text-xs text-white/40 shrink-0">
                                      {source.date}
                                    </span>
                                  )}
                                </motion.a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {reportData.recommendations && reportData.recommendations.length > 0 && (
                          <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              <Zap className="w-5 h-5 text-primary" />
                              Recommendations
                            </h3>
                            <div className="space-y-2">
                              {reportData.recommendations.map((rec, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 1.2 + index * 0.1 }}
                                  className="flex items-start gap-3 p-3 bg-black/20 rounded-xl"
                                >
                                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <span className="text-primary text-sm font-bold">{index + 1}</span>
                                  </div>
                                  <p className="text-white/80">{rec}</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Markdown Report (collapsible) */}
                        {backendResponse?.result && (
                          <details className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <summary className="text-white font-semibold cursor-pointer hover:text-primary transition-colors">
                              View Full Detailed Report
                            </summary>
                            <div className="mt-4 p-4 bg-black/40 rounded-xl overflow-x-auto">
                              <pre className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                                {backendResponse.result}
                              </pre>
                            </div>
                          </details>
                        )}

                        {/* Raw Data (collapsible) */}
                        {backendResponse && Object.keys(backendResponse).length > 0 && (
                          <details className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <summary className="text-white font-semibold cursor-pointer hover:text-primary transition-colors">
                              View Raw JSON Data
                            </summary>
                            <pre className="mt-4 p-4 bg-black/40 rounded-xl overflow-x-auto text-xs text-white/70">
                              {JSON.stringify(backendResponse, null, 2)}
                            </pre>
                          </details>
                        )}
                      </motion.div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={resetForm}
                        className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                      >
                        Process Another URL
                      </button>
                      {reportData && (
                        <button
                          onClick={() => {
                            const dataStr = JSON.stringify(reportData, null, 2)
                            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
                            const exportFileDefaultName = `report-${Date.now()}.json`
                            const linkElement = document.createElement('a')
                            linkElement.setAttribute('href', dataUri)
                            linkElement.setAttribute('download', exportFileDefaultName)
                            linkElement.click()
                          }}
                          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Report
                        </button>
                      )}
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
