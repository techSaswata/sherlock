"use client"

import { useEffect, useRef } from "react"
import { TestimonialsColumn } from "@/components/ui/testimonials-column"

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll(".fade-in-element")
            elements.forEach((element, index) => {
              setTimeout(() => {
                element.classList.add("animate-fade-in-up")
              }, index * 300)
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const testimonials = [
    {
      text: "This tool has saved us from publishing false information multiple times. The instant verification is a game-changer for our newsroom.",
      name: "Sarah Mitchell",
      role: "Investigative Journalist",
    },
    {
      text: "As a researcher, I need to verify sources constantly. This platform cuts my fact-checking time by 80% while improving accuracy.",
      name: "Dr. James Chen",
      role: "Academic Researcher",
    },
    {
      text: "We use this daily to verify viral content before our clients respond. The confidence scores and evidence reports are invaluable.",
      name: "Maria Rodriguez",
      role: "PR Manager",
    },
    {
      text: "The AI detected deepfakes that would have fooled our team. This is essential for anyone working with digital content.",
      name: "David Kim",
      role: "Content Moderator",
    },
    {
      text: "Finally, a tool that provides clear evidence for why content is authentic or fake. The detailed reports make it easy to explain to others.",
      name: "Lisa Thompson",
      role: "Fact-Checker",
    },
    {
      text: "We've prevented several misinformation campaigns from spreading thanks to the early detection. Worth every penny.",
      name: "Michael Torres",
      role: "Social Media Manager",
    },
    {
      text: "The image analysis is incredibly accurate. It's caught AI-generated photos that looked completely real to the human eye.",
      name: "Jennifer Walsh",
      role: "Photo Editor",
    },
    {
      text: "As an educator, I use this to teach students about media literacy. The evidence-based approach makes learning engaging.",
      name: "Robert Garcia",
      role: "Media Studies Professor",
    },
  ]

  return (
    <section id="testimonials" ref={sectionRef} className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-32">
          <div className="fade-in-element opacity-0 translate-y-8 transition-all duration-1000 ease-out inline-flex items-center gap-2 text-white/60 text-sm font-medium tracking-wider uppercase mb-6">
            <div className="w-8 h-px bg-white/30"></div>
            Trusted By Professionals
            <div className="w-8 h-px bg-white/30"></div>
          </div>
          <h2 className="fade-in-element opacity-0 translate-y-8 transition-all duration-1000 ease-out text-5xl md:text-6xl lg:text-7xl font-light text-white mb-8 tracking-tight text-balance">
            Fighting misinformation <span className="font-medium italic">together</span>
          </h2>
          <p className="fade-in-element opacity-0 translate-y-8 transition-all duration-1000 ease-out text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Discover how journalists, researchers, and content professionals are using our platform to verify
            authenticity and combat fake content
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="fade-in-element opacity-0 translate-y-8 transition-all duration-1000 ease-out relative flex justify-center items-center min-h-[600px] md:min-h-[800px] overflow-hidden">
          <div
            className="flex gap-8 max-w-6xl"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            }}
          >
            <TestimonialsColumn testimonials={testimonials.slice(0, 3)} duration={15} className="flex-1" />
            <TestimonialsColumn
              testimonials={testimonials.slice(2, 5)}
              duration={12}
              className="flex-1 hidden md:block"
            />
            <TestimonialsColumn
              testimonials={testimonials.slice(1, 4)}
              duration={18}
              className="flex-1 hidden lg:block"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
